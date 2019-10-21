// HOLY SHIT, A TEST SUITE!
const { app: puppeteerApp } = require('../src/puppeteer/app')
const request = require('supertest')
const { destroyDb, initDb, db } = require('../src/puppeteer/db')

describe('puppeteerServer', () => {
  beforeEach(async () => {
    await destroyDb() && await initDb()
  })

  describe('POST /post/:id/report', () => {
    describe('with past content', () => {
      beforeEach(async () => {
        await db('extractedContent').insert({ id: 'oop', status: 'seen' })
      })

      it('changes status', async () => {
        expect.assertions(4)

        const res = await request(puppeteerApp)
          .post('/post/oop/report')
          .send({ status: 'uhhh' })

        expect(res.body).toEqual({})
        expect(res.status).toEqual(200)
        expect((await db('extractedContent').first()).status).toEqual('uhhh')
        expect(await db('extractedContent').count()).toEqual([{ count: '1' }])
      })
    })

    describe('without past content', () => {
      it('changes status and creates', async () => {
        expect.assertions(4)

        const res = await request(puppeteerApp)
          .post('/post/oop/report')
          .send({ status: 'uhhh' })

        expect(res.body).toEqual({})
        expect(res.status).toEqual(200)
        expect((await db('extractedContent').first()).status).toEqual('uhhh')
        expect(await db('extractedContent').count()).toEqual([{ count: '1' }])
      })
    })
  })

  describe('POST /post/:id/url', () => {
    const url = 'www.gogole.com'

    describe('with past content', () => {
      beforeEach(async () => {
        await db('extractedContent').insert({ id: 'oop', status: 'seen' })
      })

      test('It should 200 and return a transformed version of GitHub response', async () => {
        expect.assertions(4)

        const res = await request(puppeteerApp)
          .post('/post/oop/url')
          .send({ url })

        expect(res.body).toEqual({})

        expect(await db('extractedContent').count()).toEqual([{ count: '1' }])
        expect(await db('urls').count()).toEqual([{ count: '1' }])
        expect((await db('urls').first()).url).toEqual(url)
      })
    })

    describe('without past content', () => {
      test('It should 200 and return a transformed version of GitHub response', async () => {
        expect.assertions(5)

        expect(await db('urls').count()).toEqual([{ count: '0' }])

        const res = await request(puppeteerApp)
          .post('/post/oop/url')
          .send({ url })

        expect(res.body).toEqual({})

        expect(await db('extractedContent').count()).toEqual([{ count: '1' }])
        expect(await db('urls').count()).toEqual([{ count: '1' }])
        expect((await db('urls').first()).url).toEqual(url)
      })
    })
  })
})
