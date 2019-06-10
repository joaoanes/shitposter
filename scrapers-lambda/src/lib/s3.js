const AWS = require('aws-sdk')
const { map, uniq } = require('lodash')
const { v4 } = require('uuid')

const { threadEvent } = require('./log')
const { executeWithRescue } = require('./junkyard')

const { BUCKET_NAME, SCRAPER_NAME } = process.env

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: BUCKET_NAME },
})

const loadFromS3 = async (Key) => {
  const s3Object = await s3.getObject({
    Key: `${SCRAPER_NAME}/${Key}`,
  }).promise()

  return JSON.parse(s3Object.Body.toString())
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
        Key: `${SCRAPER_NAME}/posts/${postId}/urls.json`,
        Body: JSON.stringify(results),
      })
        .promise()
        .then((res) => threadEvent('uploading', 'finished', { postId }) || res)
    }
  ))

  threadEvent('uploading', 'finished')

  return map(
    map(uploadedPosts, 'Key'),
    (key) => key.match(`${SCRAPER_NAME}/posts/(?<id>.*)/urls.json`).groups.id
  )
}

const getPostUrls = async (postId) => {
  try {
    threadEvent('urls-fetch', 'started', { postId })
    const result = await s3.getObject({
      Key: `${SCRAPER_NAME}/posts/${postId}/urls.json`,
    })
      .promise()
      .then(res => threadEvent('urls-fetch', 'finished', { postId }) || res)
      .then(res => JSON.parse(res.Body))
    return result
  } catch (error) {
    threadEvent('urls-fetch URL', 'fail', { error })
    return null
  }
}

const getPostRaw = async (postId) => {
  try {
    const result = await s3.getObject({
      Key: `${SCRAPER_NAME}/posts/${postId}/raw.json`,
    })
      .promise()
      .then(res => JSON.parse(res.Body))
    return result
  } catch (e) {
    return null
  }
}

const uploadPosts = (event) => async (posts) => {
  threadEvent('raw-upload', 'started')

  if (posts && posts.length === 0) {
    return posts
  }

  const thunks = map(posts, (post, postId) =>
    () => s3.upload({
      Key: `${SCRAPER_NAME}/posts/${postId}/raw.json`,
      Body: JSON.stringify(post),
    })
      .promise()
      // .then((res) => threadEvent('raw-upload', 'finished', { postId }) || res)
  )
  const uploadedPosts = await executeWithRescue(
    (new Date()).getTime() + 300000,
    200
  )(thunks)

  // threadEvent('raw-upload', 'finished')

  return map(
    map(uploadedPosts, 'Key'),
    (key) => key.match(`${SCRAPER_NAME}/posts/(?<id>.*)/raw.json`).groups.id
  )
}

const getAllPosts = async (force, scraperName) =>
  getPhonebook(scraperName)

// // hope you don't like money.
// threadEvent('moneyCrusher', 'begin')
// index = await getPhonebookFromS3()
// threadEvent('moneyCrusher', 'end')
// await s3.putObject({ Key: `${scraperName}/posts/list`, Body: JSON.stringify(index) }).promise()

const getPhonebook = async (scraperName = SCRAPER_NAME) => {
  const request = await s3.getObject({ Key: `${scraperName}/posts/list` }).promise()

  return JSON.parse(
    request.Body
  )
}

const addToPhonebook = async (postIds) => {
  var allPosts

  try {
    const request = await s3.getObject({ Key: `${SCRAPER_NAME}/posts/list` }).promise()
    allPosts = JSON.parse(request.Body)
  } catch (e) {
    threadEvent('phonebook-update', 'error', { error: e })
    allPosts = []
  }

  const newAllPosts = new Set([...allPosts, ...postIds])
  if (newAllPosts.size === 0 || newAllPosts.size === allPosts.length) {
    threadEvent('phonebook-update', 'early-return')
    return
  }

  threadEvent('phonebook-update', 'start', { length: newAllPosts.size, incomingLength: postIds.length, existingLength: allPosts.length })

  await s3.putObject({
    Key: `${SCRAPER_NAME}/posts/list`,
    Body: JSON.stringify(Array.from(newAllPosts)),
  }).promise()

  threadEvent('phonebook-update', 'end')
}

const getPhonebookFromS3 = async () => {
  let isTruncated
  let marker
  let contents = []
  do {
    let params = { Prefix: `${SCRAPER_NAME}/posts` }
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
    map(contents, post => post.Key.match(`${SCRAPER_NAME}/posts/(?<name>.*)/`).groups.name).filter(id => id.match('.*-.*'))
  )
}

const dropFileToS3 = async (array) => {
  const uuid = v4()
  await s3.putObject({
    Key: `${SCRAPER_NAME}/drop/${uuid}`,
    Body: JSON.stringify(array),
  }).promise()

  return `${SCRAPER_NAME}/drop/${uuid}`
}

module.exports = {
  loadFromS3,
  uploadPosts,
  getAllPosts,
  getPostUrls,
  getPostRaw,
  uploadUrls,
  addToPhonebook,
  getPhonebook,
  dropFileToS3,
}
