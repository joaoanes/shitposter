const { HTML } = require('nodekogiri')

const parseHTML = (html) => {
  const doc = new HTML(html)
}

const getProperty = async (prop, handles) => Promise.all(
  handles.map(async (handle) => {
    const propertyHandle = await handle.getProperty('src')
    return propertyHandle.jsonValue()
  })
)

const handleImg = async (doc) => getProperty('src', await doc.search('img'))
const handleSource = async (doc) => getProperty('src', await doc.search('source:first-child'))

module.exports = {
  parseHTML,
}
