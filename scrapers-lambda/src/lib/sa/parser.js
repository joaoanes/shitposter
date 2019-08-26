const { flow, map, filter, flatMap } = require('lodash/fp')
const { URL } = require('url')

const { getPostRaw } = require('../s3')
const { parseHTML, document } = require('../parsers/htmlparser')
const { thunker, executeInSequence, pipeAsync } = require('../junkyard')

const parsePosts = async (data, hashtags) => {
  const urls = await pipeAsync(
    getPostsFromRecords,
    fetchPosts,
    extractPosts,
    map(parseMessage),
    filter(([urls, meta]) => urls.length !== 0),
    map(parseMeta(hashtags)),
    unwind
  )(data)

  return urls
}

const inBlacklist = (url) => url.indexOf('.somethingawful.com') === -1

const isURL = (url) => {
  try {
    return new URL(url) && true
  } catch (e) {
    return false
  }
}

const unwind = (
  flatMap(([urls, meta]) => urls.map(url => [url, meta]))
)

const getPostsFromRecords =
  flow(
    map('body'),
    map(JSON.parse),
    map('postId')
  )

const fetchPosts = async (postIds) => (
  executeInSequence(
    postIds.map(thunker(getPostRaw))
  )
)

const extractPosts = (posts) => (
  posts.map(({ raw, id }) => [null, { raw, id }])
)

const parseMeta = (hashtags) => ([_msg, meta]) => {
  const doc = document(meta.raw)
  return [
    _msg,
    {
      hashtags: hashtags || [],
      id: meta.id,
      originalPostId: doc.at('table').id,
      postedAt: new Date(
        doc.at('.postdate').text()
          .slice(5)
      ).toISOString(),
      postedBy: doc.at('td.userinfo').class.split(' ').filter(e => e !== 'userinfo')[0].slice(7),
    },
  ]
}

const parseMessage = ([_, meta]) => {
  const { raw: rawPost } = meta
  const urls = parseHTML(rawPost)
    .filter(e => e) // remove nulls
    .filter(isURL)
    .filter(inBlacklist)
  return [urls, meta]
}

module.exports = {
  parse: parsePosts,
}
