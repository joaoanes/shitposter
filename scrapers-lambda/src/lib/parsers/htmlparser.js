const { HTML } = require('nodekogiri')
const { flatMap, sortBy, first } = require('lodash')

const document = (html) => new HTML(html)

const parseHTML = (html) => {
  const doc = new HTML(html)

  const handlers = [
    handleImg,
    handleAnchors,
    handleVideo,
  ]

  return flatMap(handlers, f => f(doc))
}

const getProperty = (prop, handles) => (
  handles.map((handle) => handle[prop])
)

const getPriority = (type) => {
  const priorities = {
    'video/mp4': 10,
    'video/webm': 5,
  }

  return priorities[type] || 1
}

const getBestSources = (videos) => {
  if (videos === null) {
    return []
  }

  return videos.map((node) => {
    const sources = node.search('source')
    return sortBy(sources, (source, otherSource) => (
      getPriority(source) > getPriority(otherSource)
    ))[0].src
  })
}

const handleImg = (doc) => getProperty('src', doc.search('img'))
const handleAnchors = (doc) => getProperty('src', doc.search('a'))
const handleVideo = (doc) => getBestSources(doc.search('video'))

module.exports = {
  parseHTML,
  document,
}
