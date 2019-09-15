const express = require('express')
const cors = require('cors')
const { v4 } = require('uuid')
require('dotenv').config()

const { getStats, performEvent } = require('./puppeteer')
const { createEvent, addUrl, updatePostStatus } = require('./db')
const { puppeteerEvent } = require('../common/log')

const app = express()
app.use(cors({ optionsSuccessStatus: 200 }))

app.use(express.json())

app.use((req, res, next) => {
  console.warn(req.url, req.query, new Date().getTime())
  return next()
})

app.get('/stats', async (req, res) => {
  const stats = await getStats()

  res.send(stats)
})

app.get('/execute', async (req, res) => {
  const { ignoreInit, ignoreSubmit, scraperName } = req.query
  const eventId = v4()
  await createEvent(eventId)
  res.send(eventId)
  await performEvent(eventId, ignoreInit, ignoreSubmit, scraperName)
})

app.post('/post/:id/url', async (req, res) => {
  try {
    await addUrl(req.params.id, req.body.url)
  } catch (e) {
    puppeteerEvent('post_url', 'error', { e: e.toString() })
    res.status(500).send({})
  }

  res.status(200).send()
})

app.post('/post/:id/report', async (req, res) => {
  try {
    await updatePostStatus(req.params.id, req.body.status)
  } catch (e) {
    puppeteerEvent('post_url', 'error')
    res.status(500).send({ e: e.toString() })
  }

  res.status(200).send()
})

module.exports = {
  app,
}
