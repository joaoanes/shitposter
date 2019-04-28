const { get } = require('axios')
const { partition } = require('lodash')
const { flow, uniqBy, reduce, groupBy, first, mapValues } = require('lodash/fp')
const { parse: parseHTML } = require('node-html-parser')

const { parsePosts, fetchThreads } = require('./scraper')
const { threadIdToInteger } = require('./junkyard')

const parse = async (posts) => (
  parsePosts(posts)
)

const fetch = async (threads, doInThread) => (
  fetchThreads(threads || await getThreads(), doInThread)
)

const updateIndex = async (lastThreadId) => {
  const allThreads = await getThreads()
  // eslint-disable-next-line no-unused-vars
  const [_oldThreads, newThreads] = partition(
    allThreads.sort((a, b) => a - b),
    (id) => threadIdToInteger(id) <= lastThreadId,
  )

  const fetchedThreads = await fetchThreads(newThreads, e => e)

  return flow(
    reduce.convert({ cap: false })((a, posts, thread) => (
      [
        ...a, ...posts.map(p => ({
          ...p,
          threadId: thread,
        })),
      ]),
    [],
    ),
    uniqBy((e) => e.PostId),
    groupBy((post) => `${post.threadId}-${post.PostId}`),
    mapValues(first),
  )(fetchedThreads)
}

const list = async (lastPostId) => {
  let lastThreadId = null
  try {
    lastThreadId = threadIdToInteger(
      lastPostId.match('(?<threadId>.*)-.*').groups.threadId
    )
  } catch (e) {

  }

  debugger
}

const getThreads = async () => {
  const result = await get('https://forum.facepunch.com/search/?q=LMAO+(pictures+%7C%7C+pics)+v&type=Thread&forum=11')
  const html = parseHTML(result.data)
  const links = html.querySelectorAll('.searchheader a').map(e => e.attributes.href)

  return links.map(link => link.match(/general\/([a-z]*)\/.*/)[1])
}

module.exports = {
  parse,
  fetch,
  list,
  getThreads,
}
