require("dotenv-flow").config()
const express = require("express")
const { instance } = require("./src/uniquer")

const { PORT } = process.env

const app = express()
const instancePromise = instance()

app.get("/uniq", async (req, res) => {
  const uniquer = await instancePromise
  res.send(await uniquer.checkUniqueness(req.params.url))
})

app.listen(PORT, () => console.log(`Uniquer listening on port ${PORT}!`))
