const AWS = require('aws-sdk')

const { threadEvent } = require('./log')

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

const uploadPosts = (event) => async (posts) => {
  if (posts && posts.length === 0) {
    return posts
  }

  const Key = `${event.id}/urls.json`

  threadEvent('uploading', 'started', { key: Key })
  await s3.upload({
    Key,
    Body: JSON.stringify(posts),
  })
    .promise()
    .then(() => threadEvent('uploading', 'finished', { key: Key }))

  return posts
}

module.exports = {
  uploadThreadPosts,
  loadFromS3,
  uploadPosts,
}
