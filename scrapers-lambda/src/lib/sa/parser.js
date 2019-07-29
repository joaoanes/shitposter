const { flatten, reduce, countBy, chunk } = require('lodash')
const { get, flow, map, filter, reduce: reduceFP } = require('lodash/fp')
const { getPostRaw } = require('../s3')
const { thunker } = require('../junkyard')

const parsePosts = async (data) => {
  const urls = flow(
    getPostsFromRecords,
    fetchPosts,
    extractMessages,
    map(parseMessage),
    map(parseMeta),
  )(data)

  return urls
}

const getPostsFromRecords =
  flow(
    map('body'),
    map(JSON.parse),
    map('postId')
  )

const fetchPosts = (postIds) => {
  postIds.map(thunker(getPostRaw))
}

const extractMessages = (html) => (
  flatten(
    [
      /\[img\](.*?)\[\/img\]/ig,
      /\[video\](.*?)\[\/video\]/ig,
      /\[media\](.*?) \[\/media\]/ig,
    ].map((regex) => {
      const matches = html.match(regex)
      if (matches === null) {
        return []
      }
      return matches
    })
  ).filter(e => e)
)

const parseMeta = ([_msg, meta]) => {

}
// const { Votes: votes, CreatedDate: date, internalPostId } = meta

// const allRatings = reduce(votes, (acc, val, key) => [...acc, ...(new Array(val).fill(Number.parseInt(key)))], [])
//  [
//   _msg,
//   {
//     ratingIds: [], // TODO: what do?
//     urlDate: date,
//     internalPostId,
//   },
// ]

const parseMessage = ([msgString, meta]) => {
  // let parsedMsg
  // try {
  //   parsedMsg = JSON.parse(msgString)
  //   if (parsedMsg['ops'] == null) {
  //     throw new Error('No ops')
  //   }
  // } catch (e) {
  //   return [extractUrlsOld(msgString), meta]
  // }
  // return [extractUrls(parsedMsg), meta]
}

module.exports = {
  parse: parsePosts,
}
