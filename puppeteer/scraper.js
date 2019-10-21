const AWS = require('aws-sdk')
const { scrape } = require('./src/lmaoscraper')

const bucketName = process.env.BUCKET_NAME

exports.myHandler = async (event, context, callback) => {
  console.warn(`Starting for ${event.id}`)
  const urls = await scrape(event.fromThreadId)
  var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: bucketName },
  })

  s3.upload({
    Key: `${event.id}/urls.json`,
    Body: JSON.stringify(urls),
    ACL: 'public-read',
  })
}
