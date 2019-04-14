const express = require('express')

const { getStats, performEvent } = require('./puppeteer')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use((req, res, next) => {
  console.log(req.url)
  return next()
})

app.get('/stats', async (req, res) => {
  debugger
  const stats = await getStats().catch(e => e)
  debugger
  res.send(stats)
})

app.get('/execute', async (req, res) => {
  const { ignoreInit, ignoreFetch, ignoreSubmit } = req.body
  res.send(await performEvent(ignoreInit, ignoreFetch, ignoreSubmit).catch(e => e))
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
