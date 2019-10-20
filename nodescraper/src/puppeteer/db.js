const { flow, map, reduce } = require('lodash/fp')
const { v4 } = require('uuid')
const { merge, zipObject } = require('lodash')
require('dotenv').config()

const {
  DATABASE_URL,
} = process.env

const getConfig = (env) => configs[env] || configs.development

const configs = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: DATABASE_URL,
    },
    useNullAsDefault: true,
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: DATABASE_URL,
    },
    useNullAsDefault: true,
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './test.sqlite',
    },
    useNullAsDefault: true,
  },
}

const db = require('knex')(getConfig(process.env.NODE_ENV))

const { executeInChunks } = require('../common/junkyard')
const { postEvent } = require('../common/log')

const destroyDb = () => db.schema.dropTableIfExists('extractedContent') && db.schema.dropTableIfExists('event') && db.schema.dropTableIfExists('urls')

const createTableIfNotExists = async (table, fun) => {
  const exists = await db.schema.hasTable(table)
  if (!exists) {
    return db.schema.createTable(table, fun)
  }
}

const initDb = async () => {
  console.warn('initting db')
  try {
    await db.schema.dropTableIfExists('extractedContent')
    await createTableIfNotExists('extractedContent', (table) => {
      table.string('id').primary()
      table.string('data')
      table.string('status').index()
      table.dateTime('createdAt').defaultTo(db.fn.now())
      table.dateTime('updatedAt').defaultTo(db.fn.now())
      table.string('scraper').index()
    })

    await db.schema.dropTableIfExists('urls')
    await createTableIfNotExists('urls', (table) => {
      table.string('id').primary()
      table.string('url')
      table.string('extractedContentId').notNullable()
      table
        .foreign('extractedContentId')
        .references('id')
        .inTable('extractedContent')
      table.dateTime('createdAt').defaultTo(db.fn.now())
      table.dateTime('updatedAt').defaultTo(db.fn.now())
    })

    await db.schema.dropTableIfExists('events')
    await createTableIfNotExists('events', (table) => {
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
  db('events').update({ [`posts${type}`]: JSON.stringify(posts), updatedAt: db.fn.now() })
    .where({ id })
)

const ensurePostExists = async (id) => {
  const post = await db('extractedContent').where({ id })
  if (post.length === 0) {
    await insertPosts([id], 'unknown')
  }
}

const updatePostStatus = async (id, status) => {
  await assureInited()
  await ensurePostExists(id)

  return db('extractedContent')
    .update({ status, updatedAt: db.fn.now() })
    .where({ id })
}

const addUrl = async (postId, url) => {
  await assureInited()

  await ensurePostExists(postId)

  await db('urls').insert({
    id: v4(),
    url,
    extractedContentId: postId,
  })

  return db('extractedContent')
    .update({ status: 'sanitized', updatedAt: db.fn.now() })
    .where({ id: postId })
}

const postsPerStatusByScraper = async (scraperName) => (await assureInited()) && flow(
  map(({ status, 'count(`id`)': count }) => ({ [status]: count })),
  reduce((acc, cur) => merge(acc, cur), {}),
)(
  await db('extractedContent').select('status')
    .count('id')
    .groupBy('status')
    .where({ scraper: scraperName })
)
const postsPerStatus = async (scraperNames) => zipObject(
  scraperNames,
  await Promise.all(map(postsPerStatusByScraper)(scraperNames)),
)

const getLastKnownPost = async (scraperName) => {
  await assureInited()
  const rows = await db.raw(`select id from "extractedContent" where scraper = ${scraperName} order by length(id) DESC, id DESC LIMIT 1;`)

  return rows.length !== 0 ? rows[0].id : null
}

const getLastKnownPosts = scraperNames => zipObject(
  scraperNames,
  Promise.all(map(getLastKnownPost)(scraperNames))
)

const getPostsByStatus = async (status) => {
  await assureInited()
  const response = await db('extractedContent')
    .where({ status })

  return response
}

const hasTables = () => (
  db.schema.hasTable('extractedContent') && db.schema.hasTable('events') && db.schema.hasTable('urls')
)

const assureInited = async () => (
  !(await hasTables()) ? initDb() : true
)

const insertPosts = async (postIds, scraper) => (await assureInited()) && db.batchInsert(
  'extractedContent',
  postIds.map(postId => ({
    id: postId,
    status: 'seen',
    scraper,
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
  getLastKnownPosts,
  createEvent,
  updateEventPosts,
  listEvents,
  addUrl,
  updatePostStatus,
  db, // TODO: remove
}
