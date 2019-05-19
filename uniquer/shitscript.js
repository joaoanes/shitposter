require("dotenv-flow").config();
const { instance } = require("./src/uniquer")

const instancePromise = instance()

const test = async () => {
  const uniquer = await instancePromise
  const result = await uniquer.checkUniqueness(
    "https://s3.eu-central-1.amazonaws.com/shitposter-content/content/E523AAB8E3C669156E9877C404D2C502",
  )
  debugger
  console.log(result)
  const result2 = await uniquer.checkUniqueness(
    "https://s3.eu-central-1.amazonaws.com/shitposter-content/content/E523AAB8E3C669156E9877C404D2C502",
  )
  console.log(result2)
}

test()
