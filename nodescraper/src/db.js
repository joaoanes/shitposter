const db = require('knex')({
  client: 'pg',
  connection: 'postgres://puppeteer:4MU7wtzeZVo7gNeenK2hv1eDeeTb8kv9@terraform-20190411215912929500000001.ccfqufjt6onb.eu-central-1.rds.amazonaws.com:5432/scrapers_posts?sslmode=verify-full',
})
const { executeInChunks } = require('./junkyard')
const { postEvent } = require('./log')

const destroyDb = () => db.schema.dropTableIfExists('extractedContent')

const initDb = async () => {
  console.log('initting db')
  await db.schema.createTable('extractedContent', (table) => {
    table.string('id').primary()
    table.string('data')
    table.string('status')
    table.dateTime('createdAt').defaultTo(db.fn.now())
    table.dateTime('updatedAt').defaultTo(db.fn.now())

    table.unique('id')
  })

  return true
}

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
  db.schema.hasTable('extractedContent')
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
  db, // TODO: remove
}
