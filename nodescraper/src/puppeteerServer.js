const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { getStats, performEvent } = require('./puppeteer')

const app = express()
app.use(cors({ optionsSuccessStatus: 200 }))
const port = process.env.PORT || 3000

app.use(express.json())

app.use((req, res, next) => {
  console.warn(req.url, req.query, new Date().getTime())
  return next()
})

app.get('/stats', async (req, res) => {
  const stats = await getStats().catch(e => e)

  res.send(stats)
})

app.get('/execute', async (req, res) => {
  const { ignoreInit, ignoreFetch, ignoreSubmit } = req.query
  res.send(await performEvent(ignoreInit, ignoreFetch, ignoreSubmit).catch(e => e))
})

app.listen(port, () => {
  console.warn(`listening on port ${port}`)
})
