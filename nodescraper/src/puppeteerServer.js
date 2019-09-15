require('dotenv').config()
const { app } = require('./puppeteer/app')

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.warn(`listening on port ${port}`)
})
