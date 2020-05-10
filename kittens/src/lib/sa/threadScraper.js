const { last } = require('lodash')
const { updateIndex } = require('./updateIndex')

class IndexReconstructionStopped extends Error {
  constructor (post) {
    super('Index reconstruction stopped!')
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.lastSeenPost = post
  }
}

// TODO: lastSeenPostId: useful?
const ensureIndexUpdated = async (lastSeenPostId, allThreads) => {
  const { outOfTime, postIds } = await updateIndex(allThreads)

  if (outOfTime) {
    throw new IndexReconstructionStopped(
      last(postIds)
    )
  }

  return postIds
}

module.exports = {
  ensureIndexUpdated,
  IndexReconstructionStopped,
}
