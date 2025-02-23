const { uniq, flow, map } = require('lodash/fp')

const { extractDetailsFromPostId, parsePostsAndUpload } = require('./junkyard')
const { getThreads } = require('./fetch')
const { addToPhonebook, getPhonebook } = require('../s3')
const { lambdaEvent } = require('../log')

const updateIndex = async (allThreads) => {
  const phonebook = await getPhonebook()

  const phonebookThreadAndPages = flow(
    map(extractDetailsFromPostId),
    map(({ threadId, page }) => `${threadId}-${page}`),
    uniq,
  )(phonebook)

  lambdaEvent('update-index', 'start', { allThreads })

  const results = await getThreads(
    allThreads,
    (new Date()).getTime() + 120000, // 2! mins,
    parsePostsAndUpload,
    phonebookThreadAndPages,
  )

  const { stopped: outOfTime, ...fetchResults } = results
  const postIds = Object.values(fetchResults)

  await addToPhonebook(postIds)

  return { postIds, outOfTime }
}

module.exports = {
  updateIndex,
}
