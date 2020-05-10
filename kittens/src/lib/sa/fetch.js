const axios = require('axios')
const { spawnSync } = require('child_process')
const { flatten, pickBy } = require('lodash')
const { flow, map, filter, reduce } = require('lodash/fp')
const { HTML } = require('nodekogiri')
const chromium = require('chrome-aws-lambda')
const Regex = require('named-regexp-groups')

const { threadEvent, pageEvent } = require('../log')
const { mapWait, pipeAsync, executeWithRescue, LimitReachedException } = require('../junkyard')

const killChrome = () => {
  const psCall = spawnSync('ps', ['aux'])
  const killCall = spawnSync('pkill', ['-9', 'chromium']) // goddamn browser.close doesn't work DIE
  const psAfterCall = spawnSync('ps', ['aux'])
  pageEvent('chrome_pruning', 'complete', {
    psCall: psCall.output && psCall.output.toString(),
    psAfterCall: psAfterCall.output && psAfterCall.output.toString(),
    psCallErr: psCall.error && psCall.error.toString(),
    psAfterCallErr: psAfterCall.error && psAfterCall.error.toString(),
    killCall: killCall.output && killCall.output.toString(),
    killCallErr: killCall.error && killCall.error.toString(),
  })
}

const getThreads = async (threadIds, limit, doAfterPost, threadsAndPagesToIgnore) => pipeAsync(
  cleanup,
  thunksForThreadIds(doAfterPost, null),
  filterKnownPosts(threadsAndPagesToIgnore),
  executeThreadThunks(limit),
  cleanup
)(threadIds)

const cleanup = async stuff => {
  await killChrome()
  return stuff
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
        .then(doAfterPost)
        .catch(e => threadEvent('fetching', 'error', { threadId, error: e.toString() })),
    }))
  return thunks.reduce((acc, curr) => ({ ...acc, ...curr }), {})
}

const interceptHTMLRequest = (request) => {
  const type = request.resourceType()
  if (type === 'image' || type === 'media' || type === 'object') {
    request.abort()
  } else {
    request.continue()
  }
}

const getPageHTML = async (threadId, page) => {
  pageEvent('fetching', 'start', { threadId, page })
  let browser
  let res

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    })

    const tab = await browser.newPage()

    await tab.setRequestInterception(true)
    tab.on('request', interceptHTMLRequest)

    await tab.goto(`https://forums.somethingawful.com/showthread.php?threadid=${threadId}&pagenumber=${page}`, { timeout: 0 })
    res = await tab.$eval('html', e => e.innerHTML)
    await tab.goto('about:blank')

    pageEvent('fetching', 'finish', { threadId, page })
  } catch (e) {
    pageEvent('fetching', 'error', { threadId, page, error: e.toString() })
    throw LimitReachedException
  }

  if (browser) {
    const chromeProcess = await browser.process()
    await browser.close()

    chromeProcess.kill('SIGKILL') // DIE
  }

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
