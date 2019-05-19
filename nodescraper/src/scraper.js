// @flow

const axios = require('axios')
const { flatten, reduce, countBy } = require('lodash')
const { get, flow, map, filter, mapValues, groupBy, reduce: reduceFP } = require('lodash/fp')

const { threadEvent } = require('./log')
const { Semaphore, pipeAsync, thunker, executeWithRescue } = require('./junkyard')

const extractMessages = (data: any) => {
  try {
    return data.map(({ 'Message': msg, 'Meta': meta, ...rest }) => [msg, { ...meta, ...rest }])
  } catch (e) {
    // console.log(data)
    return []
  }
}

const fetchPage = async (threadId: string, page: number) => axios.get(
  `https://forum.facepunch.com/thread/${threadId}/${page}?json=1`,
  {
    maxRedirects: 0,
  }
)
  .then(res => {
    if (res.status !== 200) {
      throw new Error('Oops wrong status' + res.status)
    }
    return res.data
  })
  .catch((e) => {
    threadEvent('fetching', 'failed', { threadId, page, error: e })
    return null
  })

const extractPosts = (
  flow(
    filter(e => e !== null),
    groupBy(get('Thread.ThreadId')),
    mapValues(
      flow(
        map(get('Posts')),
        flatten
      )
    ),
  )
)

const parsePosts = async (data : [Object]) => {
  const urls = flow(
    extractMessages,
    map(parseMessage),
    map(parseMeta),
  )(data)

  return urls
}

const translateFPtoSN = (ratingId) => {
  const table = {
    '1': 7,
    '2': 6,
    '3': 7,
    '5': 3,
    '7': 7,
    '8': 9,
    '14': 1,
    '18': 4,
    '19': 2,
    '21': 4,
  }

  return table[ratingId] ? table[ratingId] : null
}

const parseMeta = ([_msg, meta]) => {
  const { Votes: votes, CreatedDate: date, internalPostId } = meta

  const allRatings = reduce(votes, (acc, val, key) => [...acc, ...(new Array(val).fill(Number.parseInt(key)))], [])
  return [
    _msg,
    {
      ratingIds: countBy(
        allRatings.map(translateFPtoSN).filter(e => e)
      ),
      urlDate: date,
      internalPostId,
    },
  ]
}

const parseMessage = ([msgString, meta]) => {
  let parsedMsg
  try {
    parsedMsg = JSON.parse(msgString)
    if (parsedMsg['ops'] == null) {
      throw new Error('No ops')
    }
  } catch (e) {
    return [extractUrlsOld(msgString), meta]
  }
  return [extractUrls(parsedMsg), meta]
}

const extractUrlsOld = (msgString) => (
  flatten(
    [
      /\[img\](.*?)\[\/img\]/i,
      /\[video\](.*?)\[\/video\]/i,
      /\[media\](.*?) \[\/media\]/i,
    ].map((regex) => {
      const matches = msgString.match(regex)
      if (matches === null) {
        return []
      }
      return matches[1]
    })
  ).filter(e => e)
)

const extractUrls = (message) => (
  message['ops']
    .map(get('insert.hotlink.url'))
    .filter(e => e)
)

const getThreadHTMLAndUpload = (func = Promise.resolve) => async (id) =>
  getThreadHTML(id).then(func)

const fetchThreads = async (threads : [string], doInThread : any, limit : Number) => (
  pipeAsync(
    map(thunker(getThreadHTMLAndUpload(doInThread))),
    executeWithRescue(limit),
    (res) => {
      if (res.length === 0) {
        return res
      }
      return reduceFP.convert({ cap: false })((acc, curr, index, collection) => {
        const re = [...acc, ...curr]
        re.stopped = collection.stopped
        // TODO: this is kinda stupid, to put it mildly
        return re
      }, [])(res)
    }
  )(threads)
)

const getThreadHTML = async (threadId: string) => {
  const finalPage = await threadSize(threadId)

  const networkQueue = new Semaphore(10)

  threadEvent('fetching', 'begin', { threadId })

  const rawThreads = await Promise.all(
    (new Array(finalPage)).fill(',')
      .map(async (_, currentPage) => {
        // threadEvent('fetching', 'queued', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })
        const yld = await networkQueue.acquire()
        // threadEvent('fetching', 'started', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })

        let result
        try {
          result = await Promise.race([
            fetchPage(threadId, currentPage),
            new Promise((resolve, reject) => {
              setTimeout(
                () => {
                  reject(new Error('timeout'))
                }
                , 20000)
            }),
          ])
        } catch (e) {
          result = null
          // threadEvent('fetching', 'timedout', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })
        }
        await yld()
        // threadEvent('fetching', 'finished', { threadId, currentPage, tasks: networkQueue.tasks.length, count: networkQueue.count })
        return result
      })
  )
  const posts = extractPosts(rawThreads)

  threadEvent('fetching', 'end', { threadId, posts: posts[threadId].length })
  return posts
}

const threadSize = async (threadId: string) => (
  axios.get(`https://forum.facepunch.com/f/fastthread/${threadId}/1/?json=1`)
    .then(
      (res) => res.data
    )
    .then(({ 'Page': { 'PerPage': perPage, 'Total': total } }) => Math.ceil(total / perPage))
)

module.exports = {
  parsePosts,
  fetchThreads,
}
