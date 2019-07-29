// @flow

const axios = require('axios')
const { flatten, reduce, countBy, chunk } = require('lodash')
const { get, flow, map, filter, reduce: reduceFP } = require('lodash/fp')
const { HTML } = require('nodekogiri')
const chromium = require('chrome-aws-lambda')
const Regex = require('named-regexp-groups')

const { threadEvent, pageEvent } = require('../log')
const { Semaphore, pipeAsync, thunker, executeWithRescue, executeInSequence } = require('../junkyard')

const fetchPage = async (threadId: string, page: number) =>
  pageEvent('fetching', 'start', { threadId, page }) ||
  axios.get(
    `https://forums.somethingawful.com/showthread.php?threadid=${threadId}&pagenumber=${page}`,
    {
      maxRedirects: 0,
    }
  )
    .then(res => {
      pageEvent('fetching', 'complete', { threadId, page })
      if (res.status !== 200) {
        throw new Error('Oops wrong status' + res.status)
      }
      return res.data
    })
    .catch((e) => {
      pageEvent('fetching', 'failed', { threadId, page, error: e.toString() })
      return null
    })

// const findIdsInPost = (postHTML) => (
//   postHTML.match(/"post " id="post\d+"/g).map(m => new Regex('(?<id>\\d+)').exec(m).groups.id)
// )

const parsePage = (threadId, pageNumber) => (data) => (
  map((table) => {
    const match = new Regex('(?<postId>\\d+)')
    const postIdMatch = match.exec(table.id)
    if (postIdMatch === null) { return null }
    return { [`sa-${threadId}-${pageNumber}-${postIdMatch.groups.postId}`]: table.toString() }
  })(
    new HTML(data).search('div#thread > table.post')
  )
)

// const parseIdsFromPage = (threadId) => (pageData, pageNumber) => {
//   const ids = findIdsInPost(pageData)
//   pageEvent('id-extracting', 'complete', { threadId, pageNumber })
//   return ids.map((id) => ({ [`sc-${threadId}-${id}`]: '' }))
// }

const combineGetThreadAndDoInThread = (func = Promise.resolve, postExtractor = extractPosts) => async (id) =>
  (func ? getThreadPostsAsHTML(id, postExtractor, func) : getThreadPostsAsHTML(id, postExtractor)) // TODO: stupid
    .catch(e => [])

const genericPostExtractor = (threadId, pageNumber, pageParser) => (
  flow(
    pageParser(threadId, pageNumber),
    flatten,
    filter(e => e != null),
    reduceFP.convert({ cap: false })((acc, curr) => {
      const key = Object.keys(curr)[0]
      acc[key] = curr[key]
      return acc
      // {...acc, ...curr} trashes memory like a motherfucker
    }, {})
  )
)

const extractPosts = (threadId, pageNumber) => (
  genericPostExtractor(threadId, pageNumber, parsePage)
)

// const extractPostIds = (threadId) => (
//   genericPostExtractor(threadId, parseIdsFromPage)
// )

// TODO: optional arguments aren't working out, maybe use config object?
const fetchThreads = async (threads : [string], doInThread : any, limit : Number, postExtractor = extractPosts) => (
  pipeAsync(
    map(thunker(combineGetThreadAndDoInThread(doInThread, postExtractor))),
    executeWithRescue(limit),
    (res) => {
      if (res.length === 0) {
        return res
      }
      const reduced = reduceFP.convert({ cap: false })(
        (acc, curr) => [...acc, ...curr],
        [],
      )(res)
      reduced.stopped = res.stopped

      return reduced
    }
  )(threads)
)

const getThreadPostsAsHTMLlegacy = async (threadId: string, postExtractor: (string, number) => ([Object]) => Object = extractPosts) => {
  threadEvent('fetching', 'begin', { threadId })
  try {
    const finalPage = await threadSize(threadId)
    const networkQueue = new Semaphore(10)

    const rawPages = await Promise.all(
      (new Array(finalPage)).fill(',')
        .map(async (_, currentPage) => {
          // threadEvent('fetching', 'queued', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })
          const yld = await networkQueue.acquire()
          threadEvent('fetching', 'started', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })

          let result
          try {
            result = await Promise.race([
              fetchPage(threadId, currentPage),
              new Promise((resolve, reject) => {
                setTimeout(
                  () => {
                    reject(new Error('timeout'))
                  }
                  , 20000)
              }),
            ])
          } catch (e) {
            result = null
            threadEvent('fetching', 'timedout', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })
          }
          await yld()
          threadEvent('fetching', 'finished', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })
          return result
        })
    )

    const posts = postExtractor(threadId)(rawPages)

    threadEvent('fetching', 'end', { threadId, posts: posts.length })

    return posts
  } catch (e) {
    threadEvent('fetching', 'error', { threadId, error: e.toString() })
    return []
  }
}

const fetchPagePuppeteer = async (threadId: string, page: number, tab) => {
  pageEvent('fetching', 'start', { threadId, page })
  await tab.goto(`https://forums.somethingawful.com/showthread.php?threadid=${threadId}&pagenumber=${page}`)
  const res = await tab.$eval('html', e => e.innerHTML)

  pageEvent('fetching', 'finish', { threadId, page })

  return res
}

const getThreadPostsAsHTML = async (threadId: string, postExtractor: (string, number) => ([Object]) => Object = extractPosts, doWithPosts = (e) => e) => {
  threadEvent('fetching', 'begin', { threadId })
  try {
    const finalPage = await threadSize(threadId)
    // TODO: startpage
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    })

    const tab = await browser.newPage()

    await tab.setRequestInterception(true)
    tab.on('request', request => {
      const type = request.resourceType()
      if (type === 'image' || type === 'media' || type === 'object') {
        request.abort()
      } else {
        request.continue()
      }
    })

    const thunks = (new Array(finalPage)).fill(',')
      .map((_, currentPage) => async () => {
      // threadEvent('fetching', 'queued', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })

        threadEvent('fetching', 'started', { threadId, currentPage })

        let result
        try {
          result = await Promise.race([
            fetchPagePuppeteer(threadId, currentPage, tab),
            new Promise((resolve, reject) => {
              setTimeout(
                () => {
                  reject(new Error('timeout'))
                }
                , 20000)
            }),
          ])
        } catch (e) {
          result = null
          threadEvent('fetching', 'timedout', { threadId, currentPage })
        }

        threadEvent('fetching', 'finished', { threadId, currentPage })
        debugger
        const posts = await postExtractor(threadId, currentPage)(result)
        debugger

        return doWithPosts(posts)
      })

    const posts = await executeWithRescue()(
      thunks,
      800000
    )

    threadEvent('fetching', 'end', { threadId, posts: posts.length })

    return posts
  } catch (e) {
    threadEvent('fetching', 'error', { threadId, error: e.toString() })
    return []
  }
}

const threadSize = async (threadId: string) => (
  axios.get(`https://forums.somethingawful.com/showthread.php?threadid=${threadId}`)
    .then(
      (res) => new HTML(res.data) // thx for the shitty HTML, SA
      // without formatting, the parser just goes haywire
    )
    .then((doc) => {
      const pageAnchor = doc.at_css("a[title='Last page']")
      if (pageAnchor.length === 0) throw new Error('No page number found')
      return Number.parseInt(
        new Regex('(?<page>\\d+)').exec(pageAnchor.text()).groups.page
      )
    })
)

module.exports = {
  fetchThreads,
  // extractPostIds,
}
