require('dotenv').config()

const { SCRAPER_NAMES } = process.env

const scraperNames = JSON.parse(SCRAPER_NAMES)

const { appWithNames } = require('./puppeteer/app')

const port = process.env.PORT || 3000

appWithNames(scraperNames).listen(port, () => {
  console.warn(`listening on port ${port} with names ${scraperNames}`)
})
