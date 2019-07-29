const { flow, uniqBy, reduce, groupBy, first, mapValues } = require('lodash/fp')
const Regex = require('named-regexp-groups')

const { uploadPosts } = require('../s3')

const threadIdToInteger = (id) => {
  if (id == null) return 0
  const a = id.split('')
    .map((char) => (char.charCodeAt(0) - 97 + 1))
    .reduce(
      ([i, a], x) => ([i - 1, x * Math.pow(26, i) + a]),
      [id.length - 1, 0],
    )[1]

  return a
}

const postMatcher = new Regex('sa-(?<threadId>\\d+)-(?<page>\\d+)-(?<postId>\\d+)')

const extractDetailsFromPostId = (innerPostId) => {
  const details = postMatcher.exec(innerPostId).groups
  return ({
    threadId: Number.parseInt(details.threadId),
    postId: Number.parseInt(details.postId),
    page: Number.parseInt(details.page),
  })
}

const extractPostFromPostId = (innerPostId) => {
  let id = null
  try {
    id = Number.parseInt(
      postMatcher.exec(innerPostId).groups.postId
    )
  } catch (e) {
    return 0
  }

  return id
}

const extractThreadFromPostId = (innerPostId) => {
  let id = null
  try {
    id = Number.parseInt(
      postMatcher.exec(innerPostId).groups.postId
    )
  } catch (e) {
    return 0
  }

  return id
}

const parsePostsAndUpload = async (fetchedThread) => {
  const posts = flow(
    reduce.convert({ cap: false })(
      (a, post, postId) => {
        a[postId] = post
        return a
      },
      {}
    ),
    uploadPosts()
  )(fetchedThread)

  return posts
}

module.exports = {
  extractPostFromPostId,
  parsePostsAndUpload,
  extractThreadFromPostId,
  threadIdToInteger,
  extractDetailsFromPostId,
}
