const { config } = require('dotenv')
const axios = require('axios')

config()

const { PUPPETEER_URL } = process.env

const reportPost = (status) => (postId) => (
  axios.post(
    `${PUPPETEER_URL}/post/${postId}/report`,
    {
      status,
    }
  )
)

const reportPostUrl = ([url, meta]) => (
  axios.post(
    `${PUPPETEER_URL}/post/${meta.id}/url`,
    {
      url: url,
    }
  )
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
