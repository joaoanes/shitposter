const axios = require('axios')
const { identity, mapValues, uniqBy, flatten } = require('lodash')

const { executeInSequence, thunker, executeInChunks } = require('./junkyard')
const { submitEvent } = require('./log')

// const UNIQUEABLE_MIMES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/gif',
// ]

const sanitizeUrl = async ([urls, meta]) => {
  submitEvent('sanitize', 'start', { urls })
  const normalizedUrls = urls.map(url => [
    url,
    {
      ...meta,
      ratingIds: mapValues(meta.ratingIds, (count) => (
        // TODO: unfair approach
        Math.floor(count / urls.length)
      )),
    },
  ]).filter(([url, meta]) => url !== null)

  // TODO: deal better with the fuckening
  // aka tags being present in old regex-extracted urls
  // neat
  const unfuckedUrls = normalizedUrls.map(([url, meta]) => {
    if (url[0] === '[') {
      const match = url.match(/\[[^\]]*\](.*)\[[^\]]*\]/i)
      return [match ? match[1] : url, meta]
    }
  })

  const uniqueUrls = uniqBy(unfuckedUrls, ([url]) => url)

  const validURls = (await executeInSequence(
    uniqueUrls.map(thunker(fetchUrl)),
    (new Date()).getTime() + 900000
  )).filter(identity)
  submitEvent('sanitize', 'finish', { urls: validURls })
  return validURls
}

const fetchUrl = async ([url, meta]) => Promise.race([
  axios.head(encodeURI(url)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout!')), 7000)),
]).then(res => {
  if (res.status !== 200) {
    submitEvent('sanitize', 'status', { status: res.status })

    if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
      submitEvent('sanitize', 'redirect', { redirect: res.request.res.responseUrl })
      return [res.request.res.responseUrl, meta]
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

const sanitize = async (urls) => (
  uniqBy(
    flatten(
      (await executeInChunks(
        // TODO: why is it throwing?
        urls.map((url) => () => sanitizeUrl(url).catch(e => null)),
        (new Date()).getTime() + 810000,
        40,
      )).filter(identity)
    ),
    ([url]) => url
  )
)

module.exports = {
  sanitize,
}
