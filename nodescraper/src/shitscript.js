const { executeInSequence } = require('./junkyard')
const { fetch, parse, submit, all } = require('./lambda')
const { getThreads } = require('./lmaoscraper')

function sleep (ms) {
  return new Promise(resolve => setTimeout(() => resolve(Math.random()), ms))
}

const testSequence = async () => {
  const f = await executeInSequence(
    new Array(4).fill('.')
      .map(() => () => sleep(1000))
  )

  console.warn('all done!', f)
}

const testEventId = 'foxxer9000'

const testParse = async () => {
  console.warn(
    await parse({ id: testEventId, multiValueQueryStringParameters: { threads: ['buuex', 'buqdh'] } })
  )
}

const testFetch = async () => {
  console.warn(
    await fetch({ id: testEventId, multiValueQueryStringParameters: { threads: ['buuex', 'buqdh'] } })
  )
}

const testSubmit = async () => {
  console.warn(
    await submit({ id: testEventId, multiValueQueryStringParameters: { threads: ['buuex', 'buqdh'] } })
  )
}

const testAll = async () => {
  console.warn(
    await all({ id: testEventId, multiValueQueryStringParameters: { threads: ['buuex', 'buqdh'] } })
  )
}

const testThreads = async () => {
  console.log(threads)
}

// testParse()
// testFetch()
// testSubmit()
testAll()
