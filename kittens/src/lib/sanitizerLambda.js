const axios = require('axios')
const { identity, uniqBy } = require('lodash')

const { pipeAsync, executeInChunks } = require('./junkyard')
const { submitEvent } = require('./log')

// const UNIQUEABLE_MIMES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/gif',
// ]

const unfuckContent = ([url, meta]) => {
  if (url[0] === '[') {
    const match = url.match(/\[[^\]]*\](.*)\[[^\]]*\]/i)
    return [match ? match[1] : url, meta]
  }
  return [url, meta]
}

const sanitizeContent = async ([url, meta]) => {
  submitEvent('sanitize', 'start', { url })

  // TODO: deal better with the fuckening
  // aka tags being present in old regex-extracted urls
  // neat
  const validContent = await pipeAsync(
    unfuckContent,
    fetchUrl,
  )([url, meta])

  submitEvent('sanitize', 'finish', { urls: validContent })
  return validContent
}

const fetchUrl = async ([url, meta]) => Promise.race([
  axios.head(encodeURI(url)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout!')), 7000)),
]).then(res => {
  if (res.status !== 200) {
    submitEvent('sanitize', 'unfamiliar_status', { status: res.status })

    if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
      submitEvent('sanitize', 'redirect', { redirect: res.request.res.responseUrl })
      return [encodeURI(res.request.res.responseUrl), meta]
    }

    return null
  }
  // const getRes = await axios.get(
  //   encodedURL,
  //   {
  //     responseType: 'arraybuffer',
  //     headers: {
  //       'Range': `bytes=0-${fileType.minimumBytes}`,
  //     },
  //   }
  // )

  // const fileBuffer = Buffer.from(getRes.data)
  // const type = fileType(fileBuffer)

  // if (find(UNIQUEABLE_MIMES, (mime) => (type === mime))) {
  //   // I guess we throw it to something now
  // }

  return [encodeURI(url), meta]
})
  .catch(e => {
    console.warn(e.message, url)
    return null
  })

const sanitizeRecords = async (records) => (
  await executeInChunks(
    records
      .map(({ body }) => JSON.parse(body))
      .map(({ url }) => url) // TODO: url is misleading, change upstream!!
      .map((content) => () => sanitizeContent(content)),
    (new Date()).getTime() + 810000,
    40,
  )).filter(identity)

const sanitize = async (records) => (
  uniqBy(
    await sanitizeRecords(records),
    ([url, _]) => url
  )
)

module.exports = {
  sanitize,
}
