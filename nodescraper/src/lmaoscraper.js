const { get } = require('axios')
const { parse: parseHTML } = require('node-html-parser')

const { parsePosts, fetchThreads } = require('./scraper')

const parse = async (posts) => (
  parsePosts(posts)
)

const fetch = async (threads, doInThread) => (
  fetchThreads(threads || await getThreads(), doInThread)
)

const getThreads = async () => {
  const result = await get('https://forum.facepunch.com/search/?q=LMAO+(pictures+%7C%7C+pics)+v&type=Thread&forum=11')
  const html = parseHTML(result.data)
  const links = html.querySelectorAll('.searchheader a').map(e => e.attributes.href)

  return links.map(link => link.match(/general\/([a-z]*)\/.*/)[1])
}

module.exports = {
  parse,
  fetch,
  getThreads,
}
