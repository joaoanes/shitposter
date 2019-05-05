const process = require('process')
const { chunk } = require('lodash')
const { compose, ifElse, is, tail, reduce } = require('ramda')

let FUCKINGSINGLETONSBreak = false
process.on('SIGINT', () => {
  if (FUCKINGSINGLETONSBreak) {
    console.warn('Hard exiting...')
    process.exit()
  }
  FUCKINGSINGLETONSBreak = true
})

class LimitReachedException extends Error {
  constructor (message, partialResults) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.partialResults = partialResults
  }
}

const executeWithRescue = (limit, chunks) => async (thunks) => {
  let results
  try {
    results = await (chunks ? executeInChunks : executeInSequence)(
      thunks,
      limit,
      chunks
    )
  } catch (e) {
    if (e instanceof LimitReachedException) {
      results = e.partialResults
      results.stopped = true
    } else {
      throw e
    }
  }
  return results
}

const composeFunctions = (func = (e) => e, func2) => async () =>
  // eslint-disable-next-line no-undef
  func2.apply(this, arguments).then(func)

const executeInSequence = (promiseThunks, limit) => (
  promiseThunks.reduce(
    (promise, thunk) => promise.then(
      checkTimeOrEBreak(aggregate(thunk), limit)
    ),
    Promise.resolve([])
  )
)

const executeInChunks = async (promiseThunks, limit, chunks = 20) => (
  chunk(promiseThunks, chunks).reduce(
    (promise, thunks) => promise.then(
      checkTimeOrEBreak(aggregateChunks(async () => (
        Promise.all(thunks.map((thunk) => thunk()))
      )))
    ),
    Promise.resolve([])
  )
)

const thunker = (func) => (arg) => async () => (
  func(arg)
)

const aggregate = (thunk) => async (previous) => {
  const res = await thunk()
  return [...previous, res]
}

const aggregateChunks = (thunk) => async (previous) => {
  const res = await thunk()
  return [...previous, ...res]
}

const checkTimeOrEBreak = (thunk, timeLimit) => async (args) => {
  if (
    (timeLimit !== null && (new Date()).getTime() > timeLimit) ||
    FUCKINGSINGLETONSBreak
  ) {
    throw new LimitReachedException('Out of time!', args)
  }
  return thunk(args)
}

const threadIdToInteger = (id) => {
  if (id == null) return 0
  const a = id.split('')
    .map((char) => (char.charCodeAt(0) - 97 + 1))
    .reduce(
      ([i, a], x) => ([i - 1, x * Math.pow(26, i) + a]),
      [id.length - 1, 0],
    )[1]

  return a
}

function _pipeAsync (f, g) {
  return function () {
    var ctx = this
    var gPromise = compose(
      val => Promise.resolve(val),
      x => g.call(ctx, x)
    )
    var resultF = f.apply(ctx, arguments)
    return ifElse(
      is(Promise),
      promise => promise.then(gPromise),
      gPromise
    )(resultF)
  }
};

function pipeAsync () {
  if (Array.isArray(arguments[0])) {
    return pipeAsync.apply(this, arguments[0])
  }
  return reduce(_pipeAsync, arguments[0], tail(arguments))
};

class Semaphore {
  constructor (count) {
    this.tasks = []
    this.count = count
  }
  sched () {
    if (this.count > 0 && this.tasks.length > 0) {
      this.count--
      let next = this.tasks.shift()
      if (next === undefined) {
        throw new Error('Unexpected undefined value in tasks list')
      }
      next()
    }
  }
  acquire () {
    return new Promise((resolve, reject) => {
      var task = () => {
        var released = false
        resolve(() => {
          if (!released) {
            released = true
            this.count++
            this.sched()
          }
        })
      }
      this.tasks.push(task)
      if (process && process.nextTick) {
        process.nextTick(this.sched.bind(this))
      } else {
        setImmediate(this.sched.bind(this))
      }
    })
  }
  use (f) {
    return this.acquire()
      .then(release => f()
        .then((res) => {
          release()
          return res
        })
        .catch((err) => {
          release()
          throw err
        }))
  }
}

module.exports = {
  executeInSequence,
  executeWithRescue,
  executeInChunks,
  composeFunctions,
  LimitReachedException,
  threadIdToInteger,
  thunker,
  pipeAsync,
  Semaphore,
}
