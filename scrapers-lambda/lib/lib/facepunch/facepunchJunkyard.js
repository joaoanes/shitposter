const { flow, uniqBy, reduce, groupBy, first, mapValues } = require('lodash/fp')

const { uploadPosts } = require('./upload')

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
    id = postId.match('(?<threadId>.*)-(?<postId>.*)').groups.threadId
  } catch (e) {
    return ''
  }

  return id
}

const parsePostsAndUpload = async (fetchedThread) => {
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
}

export {
  extractPostFromPostId,
  parsePostsAndUpload,
  extractThreadFromPostId,
  threadIdToInteger,
}
