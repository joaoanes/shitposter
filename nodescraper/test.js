const { fetchUrl } = require('./src/sanitizer.js')

const test = async () => {
  const stuff = await fetchUrl(['https://s3.eu-central-1.amazonaws.com/shitposter-content/content/C3EDC9A85E0BA96D4E7D8BF1BBB2369B', {}])
  debugger
}

test()
