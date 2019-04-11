const axios = require('axios')
const { identity, mapValues, uniqBy, flatten, find } = require('lodash')
const fileType = require('file-type')

const { executeInChunks, executeInSequence, thunker } = require('./junkyard')

const UNIQUEABLE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
]

const sanitizeUrl = async ([urls, meta]) => {
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

  const uniqueUrls = uniqBy(normalizedUrls, ([url]) => url)

  const validURls = (await executeInSequence(
    uniqueUrls.map(thunker(fetchUrl)),
    (new Date()).getTime() + 900000
  )).filter(identity)

  return validURls
}

const fetchUrl = async ([url, meta]) => {
  const encodedURL = encodeURI(url)

  try {
    const res = await axios.head(encodedURL, { timeout: 5000 })
    if (res.status !== 200) {
      console.warn('rogue ', res.status)
      return null
    }
    const getRes = await axios.get(
      encodedURL,
      {
        responseType: 'arraybuffer',
        headers: {
          'Range': `bytes=0-${fileType.minimumBytes}`,
        },
      }
    )

    const fileBuffer = Buffer.from(getRes.data)
    const type = fileType(fileBuffer)

    if (find(UNIQUEABLE_MIMES, (mime) => (type === mime))) {
      // I guess we throw it to something now
    }
  } catch (e) {
    console.warn(e.message, url)
    return null
  }

  return [encodedURL, meta]
}

const sanitize = async (urls) => (
  uniqBy(
    flatten(
      (await executeInChunks(
        urls.map((url) => () => sanitizeUrl(url)),
        (new Date()).getTime() + 900000,
        100,
      )).filter(identity)
    ),
    ([url]) => url
  )
)

module.exports = {
  sanitize,
  fetchUrl,
}
