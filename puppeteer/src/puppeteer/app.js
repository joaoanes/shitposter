const express = require('express')
const cors = require('cors')
const { v4 } = require('uuid')

const { getStats, performEvent } = require('./puppeteer')
const { createEvent, addUrl, updatePostStatus } = require('./db')
const { puppeteerEvent } = require('../common/log')

const appWithNames = (scraperNames) => {
  const app = express()
  app.use(cors({ optionsSuccessStatus: 200 }))

  app.use(express.json())

  app.use((req, res, next) => {
    console.warn(req.url, req.query, new Date().getTime())
    return next()
  })

  app.get('/stats', async (req, res) => {
    const stats = await getStats(scraperNames)

    res.send(stats)
  })

  app.get('/execute', async (req, res) => {
    const { scraperName } = req.query
    const eventId = v4()
    await createEvent(eventId)
    res.send(eventId)
    await performEvent(eventId, scraperName)
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
  return app
}

module.exports = {
  appWithNames,
}
