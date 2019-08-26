const { get } = require('lodash')
const { config } = require('dotenv')

config()

const { SCRAPER_NAME = 'lmaoscraper', NEXT_SQS_URL } = process.env

const { IndexReconstructionStopped, ensureIndexUpdated } = require('./lib/sa/threadScraper')
const { parse, getPostsFromRecords } = require('./lib/sa/parser')
const { list } = require('./lib/sa/list')
const { reportPosts, reportPostUrls } = require('./lib/puppeteer')

const { threadEvent, lambdaEvent } = require('./lib/log')
const { dropFileToS3 } = require('./lib/s3')
const { sendMessage } = require('./lib/sqs')
const { sanitize: doSanitize } = require('./lib/sanitizerLambda')

const apiGatewayResponse = (body, statusCode = 200) => {
  const resBody = ({
    'isBase64Encoded': false,
    statusCode,
    'headers': {},
    'body': JSON.stringify(body),
  })

  lambdaEvent('response', 'finish', resBody)
  return resBody
}

const newList = async (event) => {
  threadEvent('list', 'begin', { event })

  const trace = get(event, 'invokeTrace', null)
  // TODO: list() lists AND pushes to sqs. BAD.
  const posts = await list(
    get(event, 'lastPostId', null),
    trace,
  )
  threadEvent('list', 'end', { event, posts: posts.length })

  if (!trace) {
    threadEvent('list', 'drop-start', { event })
    const dropUrl = await dropFileToS3(posts)
    threadEvent('list', 'drop-end', { event, dropUrl })
    return apiGatewayResponse({
      drop: true,
      dropUrl,
    })
  }

  return apiGatewayResponse({})
}

// no more fetch!

const updateIndex = async (event) => {
  const { getThreads } = require(`./${SCRAPER_NAME}/getInfo`)
  threadEvent('updateIndex', 'begin', { event })
  try {
    const allThreads = await getThreads()

    const posts = await ensureIndexUpdated(
      get(event, 'lastPostId', null),
      allThreads
    )
    threadEvent('updateIndex', 'end', { event })
    return apiGatewayResponse({ postIds: posts.length })
  } catch (e) {
    if (e instanceof IndexReconstructionStopped) {
      return apiGatewayResponse({ lastSeenPostId: e.lastSeenPost }, 503)
    } else {
      threadEvent('updateIndex', 'error', { error: e.toString() })
      apiGatewayResponse({ error: e.toString() }, 500)
    }
  }
}

const sanitize = async (event) => {
  threadEvent('sanitize', 'begin', { event })
  const urls = await doSanitize(
    get(event, 'Records', null),
  )

  await reportPostUrls(urls)

  threadEvent('sanitize', 'end', { event, urls: urls.length })
  return apiGatewayResponse({ urls })
}

const newParse = async (event) => {
  threadEvent('parse', 'begin', { event })
  let urls
  const { getHashtags } = require(`./${SCRAPER_NAME}/getInfo`)
  try {
    const postIds = getPostsFromRecords(
      get(event, 'Records', null),
    )

    urls = await parse(
      get(event, 'Records', null),
      getHashtags(),
    )

    await Promise.all(
      urls.map(url => sendMessage(NEXT_SQS_URL, { url }))
    )

    await reportPosts(postIds, 'parsed')
  } catch (e) {
    return apiGatewayResponse({ error: e.toString(), event }, 500)
  }

  threadEvent('parse', 'end', { event, urls: urls.length })
  return apiGatewayResponse({ urls })
}

exports.list = newList
exports.updateIndex = updateIndex
exports.sanitize = sanitize
exports.parse = newParse

// newParse({
//   'Records': [{
//     'messageId': '92ad0c5b-1743-465a-b0f6-cc65b473d152',
//     'receiptHandle': 'AQEBw/WA6G0mo8EDCyhNOkZ12N75K2tlVpvg7CzpLAoOnAfwvP79Lwx/3R+YNmQy6pT1eVL4xDuqOtbX+qStcbrlXx0iyCz3au9JR4wK9tuBuwU+a/i/JLloaYwd6cQTTX53XOB5RMPm4WILHnV0LOsetWsEwkVsjBcGcFyomiVMvj30JkPht+NAApGQiArnmRXLIlWnNgT1vvGT2WwXhpPOyy7jVjpkgCnkgGdE9021Var9Nde6qwoYT0ltB/SeZ7OXLkaXZZrdl5z1gupu9EMjtoVxCejE2s0EUXpx0bw1ht9IfwcnTz7nZlgxiRLii4INzDxeXqI7+hGNMXJsVASm5e+r35ed3sDBdpRJkU2RAW4cej2miDKHDRoZFV6X78UEKyTnuRfgtIWJ+LeVR2M7aA==',
//     'body': '{"postId":"sa-3769444-149-466655802"}',
//     'attributes': {
//       'ApproximateReceiveCount': '1',
//       'SentTimestamp': '1564971406727',
//       'SenderId': 'AROAUOISLBCKBJJBQXR2N:sa-cute_list',
//       'ApproximateFirstReceiveTimestamp': '1564971461236',
//     },
//     'messageAttributes': {},
//     'md5OfBody': '647893b19e2fff67365c13d2f7e57c33',
//     'eventSource': 'aws:sqs',
//     'eventSourceARN': 'arn:aws:sqs:eu-central-1:305518020756:sa-cute_parse',
//     'awsRegion': 'eu-central-1',
//   }],
// })
