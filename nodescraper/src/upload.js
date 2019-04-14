const AWS = require('aws-sdk')
const { map, uniq, difference } = require('lodash')

const { threadEvent } = require('./log')
const { executeWithRescue } = require('./junkyard')

const bucketName = process.env.BUCKET_NAME

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: bucketName },
})

const loadFromS3 = async (Key) => {
  const s3Object = await s3.getObject({
    Key,
  }).promise()

  return JSON.parse(s3Object.Body.toString())
}

const uploadThreadPosts = (event) => async (resultThreads) => {
  const threadId = Object.keys(resultThreads)[0]
  const posts = Object.values(resultThreads)[0]

  if (posts && posts.length === 0) {
    return resultThreads
  }

  const Key = `${event.id}/threads/${threadId}.json`

  threadEvent('uploading', 'started', { key: Key })
  await s3.upload({
    Key,
    Body: JSON.stringify(posts),
  })
    .promise()
    .then(() => threadEvent('uploading', 'finished', { key: Key }))

  return resultThreads
}

const uploadUrls = (event) => async (urls) => {
  if (urls && urls.length === 0) {
    return urls
  }

  threadEvent('uploading', 'started')

  const uploadedPosts = await executeWithRescue(
    (new Date()).getTime() + 300000,
    200
  )(map(
    urls,
    ({ postId, results }) => () => {
      threadEvent('uploading', 'started', { postId })
      return s3.upload({
        Key: `posts/${postId}/urls.json`,
        Body: JSON.stringify(results),
      })
        .promise()
        .then((res) => threadEvent('uploading', 'finished', { postId }) || res)
    }
  ))

  threadEvent('uploading', 'finished')

  return map(
    map(uploadedPosts, 'Key'),
    (key) => key.match('posts/(?<id>.*)/urls.json').groups.id
  )
}

const getPostUrls = async (postId) => {
  try {
    threadEvent('getting URL', 'started', { postId })
    const result = await s3.getObject({
      Key: `posts/${postId}/urls.json`,
    })
      .promise()
      .then(res => threadEvent('getting-URL', 'finished', { postId }) || res)
      .then(res => JSON.parse(res.Body))
    return result
  } catch (error) {
    threadEvent('getting URL', 'fail', { error })
    return null
  }
}

const getPostRaw = async (postId) => {
  try {
    const result = await s3.getObject({
      Key: `posts/${postId}/raw.json`,
    })
      .promise()
      .then(res => JSON.parse(res.Body))
    return result
  } catch (e) {
    return null
  }
}

const uploadPosts = (event) => async (posts) => {
  threadEvent('uploading', 'started')

  if (posts && posts.length === 0) {
    return posts
  }

  const thunks = map(posts, (post, postId) =>
    () => {
      threadEvent('uploading', 'started', { postId })
      return s3.upload({
        Key: `posts/${postId}/raw.json`,
        Body: JSON.stringify(post),
      })
        .promise()
        .then((res) => threadEvent('uploading', 'finished', { postId }) || res)
    }
  )
  const uploadedPosts = await executeWithRescue(
    (new Date()).getTime() + 300000,
    200
  )(thunks)

  threadEvent('uploading', 'finished')

  return map(
    map(uploadedPosts, 'Key'),
    (key) => key.match('posts/(?<id>.*)/raw.json').groups.id
  )
}

const listPosts = async (force) => {
  let index
  try {
    index = getPhonebook()
  } catch (e) {
    index = await listPostsExpensive()
    await s3.putObject({ Key: 'posts/list', Body: JSON.stringify(index) }).promise()
  }
}

const getPhonebook = async () => {
  const request = await s3.getObject({ Key: 'posts/list' }).promise()

  return JSON.parse(
    request.Body
  )
}

const addToPhonebook = async (postIds) => {
  const request = await s3.getObject({ Key: 'posts/list' }).promise()
  const allPosts = JSON.parse(request.Body)
  const newPosts = difference(allPosts, postIds)
  if (newPosts.length === 0) return

  const newAllPosts = uniq([...allPosts, ...newPosts])
  threadEvent('phonebookUpdate', 'start', { difference: difference.length })
  await s3.putObject({ Key: 'posts/list', Body: JSON.stringify(newAllPosts) }).promise()
  threadEvent('phonebookUpdate', 'end')
}

const listPostsExpensive = async () => {
  let isTruncated
  let marker
  let contents = []
  do {
    let params = { Prefix: 'posts' }
    if (marker) params.Marker = marker
    try {
      threadEvent('list_posts', 'call', { marker })
      const response = await s3.listObjects(params).promise()
      contents = [...contents, ...response.Contents]
      isTruncated = response.IsTruncated
      if (isTruncated) {
        marker = response.Contents.slice(-1)[0].Key
      }
    } catch (error) {
      throw error
    }
  } while (isTruncated)

  // TODO: why is this happening? we shouldn't need an unique
  return uniq(
    map(contents, post => post.Key.match('posts/(?<name>.*)/').groups.name).filter(id => id.match('.*-.*'))
  )
}

module.exports = {
  uploadThreadPosts,
  loadFromS3,
  uploadPosts,
  listPosts,
  getPostUrls,
  getPostRaw,
  uploadUrls,
  addToPhonebook,
  getPhonebook,
}
