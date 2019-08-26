const axios = require('axios')
const { flatten, pickBy } = require('lodash')
const { flow, map, filter, reduce } = require('lodash/fp')
const { HTML } = require('nodekogiri')
const chromium = require('chrome-aws-lambda')
const Regex = require('named-regexp-groups')

const { threadEvent, pageEvent } = require('../log')
const { mapWait, pipeAsync, executeWithRescue } = require('../junkyard')

const getThreads = async (threadIds, limit, doAfterPost, threadsAndPagesToIgnore) => {
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

  return pipeAsync(
    thunksForThreadIds(doAfterPost, tab),
    filterKnownPosts(threadsAndPagesToIgnore),
    executeThreadThunks(limit)
  )(threadIds)
}

const filterKnownPosts = (toIgnore) => threadThunks => (
  pickBy(threadThunks, (thunk, key) => (
    toIgnore.indexOf(key) === -1
  ))
)

const executeThreadThunks = (limit) => async (fetchThunks) => (
  pipeAsync(
    executeWithRescue(limit),
    (res) => {
      if (res.length === 0) {
        return res
      }
      const reduced = reduce.convert({ cap: false })(
        (acc, curr) => [...acc, ...curr],
        [],
      )(res)
      reduced.stopped = res.stopped

      return reduced
    }
  )(fetchThunks)
)

const thunksForThreadIds = (doAfterPost, tab) => async (threadIds) => pipeAsync(
  mapWait(getPageFetchThunks(doAfterPost, tab)),
  reduce((acc, curr) => ({ ...acc, ...curr }), {}),
)(threadIds)

const getPageFetchThunks = (doAfterPost = Promise.resolve, tab) => async (threadId) => {
  threadEvent('fetching', 'begin', { threadId })

  const finalPage = await threadSize(threadId)
  const thunks = (new Array(finalPage)).fill(',')
    .map((_, i) => ({
      [`${threadId}-${i + 1}`]: async () => getPageHTML(threadId, i + 1, tab)
        .then(extractPostsFromHTML(threadId, i + 1))
        .then(doAfterPost),
    }))
  return thunks.reduce((acc, curr) => ({ ...acc, ...curr }), {})
}

const getPageHTML = async (threadId, page, tab) => {
  pageEvent('fetching', 'start', { threadId, page })

  await tab.goto(`https://forums.somethingawful.com/showthread.php?threadid=${threadId}&pagenumber=${page}`, { timeout: 0 })
  const res = await tab.$eval('html', e => e.innerHTML)

  pageEvent('fetching', 'finish', { threadId, page })

  return res
}

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

const extractPostsFromHTML = (threadId, pageNumber) => (
  flow(
    parsePage(threadId, pageNumber),
    flatten,
    filter(e => e != null),
    reduce.convert({ cap: false })((acc, curr) => {
      const key = Object.keys(curr)[0]
      acc[key] = curr[key]
      return acc
      // {...acc, ...curr} trashes memory like a motherfucker
    }, {})
  )
)

const threadSize = async (threadId) => (
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
  getThreads,
}
