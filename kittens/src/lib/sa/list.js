const { chunk, filter } = require('lodash')

const { getAllPosts } = require('../s3')
const { extractPostFromPostId } = require('./junkyard')
const { sendMessage } = require('../sqs')
const { invokeLambda } = require('../invoke')

const { NEXT_SQS_URL, SCRAPER_NAME } = process.env

const chunkAndInvokeLambdas = (postIds) => {
  const postIdChunks = chunk(postIds, 3000)
  return postIdChunks.map((postIdsChunk) => () => (
    invokeLambda(`${SCRAPER_NAME}_list`, { invokeTrace: { postIds: postIdsChunk } })
  ))
}

const getPostsAndParallelize = async (lastPostId) => {
  const allPosts = await getAllPosts()
  const lastSeenPostId = extractPostFromPostId(lastPostId)

  const newPosts = filter(allPosts, (postId) => extractPostFromPostId(postId) > lastSeenPostId)

  await Promise.all(
    chunkAndInvokeLambdas(newPosts).map((thunk) => thunk())
  )

  return newPosts
}

const listAndProcessChunk = async (trace) => {
  const { postIds } = trace

  await Promise.all(
    postIds.map((postId) => sendMessage(NEXT_SQS_URL, { postId })),
  )

  return postIds
}

const listAndProcess = async (lastPostId, trace) => (
  trace ? listAndProcessChunk(trace) : getPostsAndParallelize(lastPostId)
)

module.exports = {
  list: listAndProcess,
}
