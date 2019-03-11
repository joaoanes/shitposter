const axios = require('axios')

const { getThreads } = require('./lmaoscraper')

const GATEWAY_FETCH_URL = 'https://xyiarkec66.execute-api.eu-central-1.amazonaws.com/production/fetch'

const orchestrate = async () => {
  const threads = await getThreads()
  await Promise.all(
    threads.map(async (thread) => {
      console.warn('Invoking for ', thread)
      await axios.get(`${GATEWAY_FETCH_URL}?threads=${thread}`)
      console.warn('Invoking complete for ', thread)
    })
  )
}

orchestrate()
