const express = require('express')

const { getStats, performEvent } = require('./puppeteer')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json)

app.get('/stats', async (req, res) => {
  res.send(await getStats())
})

app.get('/execute', async (req, res) => {
  const { ignoreInit, ignoreFetch, ignoreSubmit } = req.body
  res.send(await performEvent(ignoreInit, ignoreFetch, ignoreSubmit))
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
