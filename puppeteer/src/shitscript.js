// const { executeInSequence } = require('./common/junkyard')
// const { list, fetch, updateIndex } = require('./lambda/lambda')

// function sleep (ms) {
//   return new Promise(resolve => setTimeout(() => resolve(Math.random()), ms))
// }

// const testSequence = async () => {
//   const f = await executeInSequence(
//     new Array(4).fill('.')
//       .map(() => () => sleep(1000))
//   )

//   console.warn('all done!', f)
// }

// const testEventId = 'ballz'

// const testList = async () => {
//   const lol = await list()
//   console.log(lol)
// }

// const testFetch = async () => {
//   const lol = await fetch({
//     id: testEventId,

//   })
//   console.log(lol)
// }

// const testUpdate = async () => {
//   const lol = await updateIndex({
//     id: testEventId,
//     // lastPostId: 'bpwhk-cscsqb',
//   })
//   console.log(lol)
// }

// // testParse()
// // testFetch()
// // testSubmit()
// // testSanitize()

// // testAll()
// testUpdate()
// // testList()
// // testFetch()
