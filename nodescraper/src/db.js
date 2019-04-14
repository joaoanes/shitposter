const { flow, map, reduce } = require('lodash/fp')

const db = require('knex')({
  client: 'pg',
  connection: 'postgres://puppeteer:4MU7wtzeZVo7gNeenK2hv1eDeeTb8kv9@terraform-20190411215912929500000001.ccfqufjt6onb.eu-central-1.rds.amazonaws.com:5432/scrapers_posts?sslmode=verify-full',
})
const { executeInChunks } = require('./junkyard')
const { postEvent } = require('./log')

const destroyDb = () => db.schema.dropTableIfExists('extractedContent') && db.schema.dropTableIfExists('event')

const initDb = async () => {
  console.warn('initting db')
  try {
    await db.schema.dropTableIfExists('extractedContent')
    await db.schema.createTableIfNotExists('extractedContent', (table) => {
      table.string('id').primary()
      table.string('data')
      table.string('status')
      table.dateTime('createdAt').defaultTo(db.fn.now())
      table.dateTime('updatedAt').defaultTo(db.fn.now())
    })

    await db.schema.dropTableIfExists('events')
    await db.schema.createTableIfNotExists('events', (table) => {
      table.string('id').primary()
      table.json('postsInited')
      table.json('postsFetched')
      table.json('postsSubmitted')
      table.dateTime('createdAt').defaultTo(db.fn.now())
      table.dateTime('updatedAt').defaultTo(db.fn.now())
    })
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}

const listEvents = async () => (await assureInited()) && db('events')

const createEvent = async (id) => (await assureInited()) && db('events').insert({ id })

const updateEventPosts = async (id, type, posts) => (await assureInited()) && (
  db('events').update({ [`posts${type}`]: posts, updatedAt: db.fn.now() })
    .where({ id })
)

const postsPerStatus = async () => (await assureInited()) && flow(
  map(({ status, count }) => ({ [status]: count })),
  reduce((acc, cur) => ({ ...acc, ...cur })),
)(await db('extractedContent')
  .select('status')
  .count('id')
  .groupBy('status'))

const getLastKnownPost = async () => {
  await assureInited()
  const [response] = await db('extractedContent')
    .max('id')

  return response ? response.max : null
}

const getPostsByStatus = async (status) => {
  await assureInited()
  const response = await db('extractedContent')
    .where({ status })

  return response
}

const hasTables = () => (
  db.schema.hasTable('extractedContent') && db.schema.hasTable('events')
)

const assureInited = async () => (
  !(await hasTables()) ? initDb() : true
)

const insertPosts = async (postIds) => (await assureInited()) && db.batchInsert(
  'extractedContent',
  postIds.map(postId => ({
    id: postId,
    status: 'seen',
  }))
)

const updatePostsStatus = async (posts, status) => (
  (await assureInited()) && executeInChunks(
    posts.map(({ postId }) => async () => {
      postEvent('upload', 'starting', { postId })
      const res = await db('extractedContent').update({ status, updatedAt: db.fn.now() })
        .where({ id: postId })
      postEvent('upload', 'end', { postId })
      return res
    }),
    Number.MAX_SAFE_INTEGER,
    200
  )
)

module.exports = {
  getLastKnownPost,
  insertPosts,
  initDb,
  destroyDb,
  getPostsByStatus,
  updatePostsStatus,
  postsPerStatus,
  createEvent,
  updateEventPosts,
  listEvents,
  db, // TODO: remove
}
