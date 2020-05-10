const { config } = require('dotenv')
const { sendMessage } = require('./sqs')

config()

const { PUPPETEER_EVENTS_SQS_URL } = process.env

const reportPost = (status) => (postId) => (
  sendMessage(PUPPETEER_EVENTS_SQS_URL, { postId, status })
)

const reportPostUrl = ([url, meta]) => (
  sendMessage(PUPPETEER_EVENTS_SQS_URL, { id: meta.id, status: 'sanitized', url })
)

const reportPosts = (posts, status) => (
  Promise.all(
    posts.map(reportPost(status))
  )
)

const reportPostUrls = (urls) => (
  Promise.all(
    urls.map(reportPostUrl)
  )
)

module.exports = {
  reportPost,
  reportPosts,
  reportPostUrl,
  reportPostUrls,
}
