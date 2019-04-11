const { partition, map, maxBy, filter } = require('lodash')
const { get } = require('axios')
const { flow, uniqBy, reduce, groupBy, first, mapValues, map: mapFP } = require('lodash/fp')
const { parse: parseHTML } = require('node-html-parser')

const { fetchThreads, parsePosts } = require('./scraper')
const { uploadPosts, listPosts, getPostUrls, getPostRaw, uploadUrls } = require('./upload')
const { threadIdToInteger, executeInChunks } = require('./junkyard')

class IndexReconstructionStopped extends Error {
  constructor (post) {
    super('Index reconstruction stopped!')
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.lastSeenPost = post
  }
}

const getThreads = async () => {
  const result = await get('https://forum.facepunch.com/search/?q=LMAO+(pictures+%7C%7C+pics)+v&type=Thread&forum=11')
  const html = parseHTML(result.data)
  const links = html.querySelectorAll('.searchheader a').map(e => e.attributes.href)

  return links.map(link => link.match(/general\/([a-z]*)\/.*/)[1])
}

const extractPostFromPostId = (postId) => {
  let id = null
  try {
    id = threadIdToInteger(
      postId.match('(?<threadId>.*)-(?<postId>.*)').groups.postId
    )
  } catch (e) {

  }

  return id
}

const extractThreadFromPostId = (postId) => {
  let id = null
  try {
    id = threadIdToInteger(
      postId.match('(?<threadId>.*)-(?<postId>.*)').groups.threadId
    )
  } catch (e) {

  }

  return id
}

const updateIndex = async (lastSeenThreadId) => {
  const allThreads = await getThreads()

  const newThreads = filter(
    allThreads.sort((a, b) => a - b),
    (id) => threadIdToInteger(id) >= lastSeenThreadId,
  )

  const fetchResults = await fetchThreads(
    newThreads,
    async (fetchedThread) => {
      const posts = flow(
        reduce.convert({ cap: false })((a, posts, thread) => (
          [
            ...a, ...posts.map(p => ({
              ...p,
              threadId: thread,
              UserId: 'anon',
              Username: 'anon',
            })),
          ]),
        [],
        ),
        uniqBy((e) => e.PostId),
        groupBy((post) => `${post.threadId}-${post.PostId}`),
        mapValues(first),
      )(fetchedThread)

      return uploadPosts()(posts)
    },
    (new Date()).getTime() + 800000, // 14 mins
  )

  return fetchResults
}

const postsNewerThan = async (lastPostId) => {
  const allPosts = await listPosts()
  const lastSeenPostId = extractPostFromPostId(lastPostId)

  return filter(allPosts, (postId) => extractPostFromPostId(postId) > lastSeenPostId)
}

const ensureIndexUpdated = async (lastSeenThreadId) => {
  const { outOfTime, posts } = await updateIndex(lastSeenThreadId)
  if (outOfTime) {
    throw new IndexReconstructionStopped(
      maxBy(posts, extractPostFromPostId)
    )
  }
}

const list = async (lastPostId) => postsNewerThan(lastPostId)

const fetch = async (lastPostId, posts) => {
  const postsToFetch = posts || (await postsNewerThan(lastPostId))
  const rawPosts = await executeInChunks(
    postsToFetch.map(post => () => getPostUrls(post).then(results => ({ postId: post, results }))),
    Number.MAX_SAFE_INTEGER,
    200,
  )

  const [withoutResults, withResults] = partition(rawPosts, ({ results }) => results === null)

  const fetchedResults = await Promise.all(
    withoutResults
      .map(({ postId }) => getPostRaw(postId).then(res => ({ [postId]: res })))
  )
    .then(reduce((acc, val) => ({ ...acc, ...val }), {}))
    .then(async (rawPosts) => {
      const res = await parsePosts(map(
        rawPosts,
        (originalPost, postId) => ({ ...originalPost, internalPostId: postId })
      ))

      const group = flow(
        groupBy(([_res, { internalPostId }]) => internalPostId),
        mapFP.convert({ cap: false })((v, k) => ({ postId: k, results: v[0] }))
      )(res)

      await uploadUrls()(group)

      return group
    })

  const allResults = [
    ...withResults,
    ...fetchedResults,
  ]

  return allResults
}

module.exports = {
  fetch,
  list,
  getThreads,
  ensureIndexUpdated,
  IndexReconstructionStopped,
}
