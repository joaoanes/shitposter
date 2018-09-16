// look ma, I'm comitting a coding sin! elixir files calling node calling js code!

if (!process.argv[2]) {
  return -1
}

const puppeteer = require('puppeteer')
const md5 = require('md5')
var AWS = require('aws-sdk')
AWS.config.update({ accessKeyId: 'AKIAJNL2HLP2JBN456ZQ', secretAccessKey: '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' });


(async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = process.argv[2]
    await page.goto(url)
    const image = await page.screenshot({fullPage: true})

    var s3 = new AWS.S3({params: {Bucket: 'shitposter-content'}});
    const uploadName = md5(url) + '.png'
    s3.putObject({
      Key: 'previews/' + uploadName,
      Body: image,
      ContentType: "image/png"
    }, (err, data) => {
      if (err) {
        console.log(err)
      } else {
        console.log(`uploaded https://s3.eu-central-1.amazonaws.com/shitposter-content/previews/${uploadName}`)
      }
    })

    await browser.close()
  }
  catch (err) {
    console.error("error!", err)
    process.exit(-1)
  }
})()
