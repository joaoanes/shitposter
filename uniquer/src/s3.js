const AWS = require("aws-sdk")

const { uniquerEvent } = require("./log")

const Bucket = process.env.BUCKET_NAME

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket },
})

const loadFromS3 = async (Key) => {
  const s3Object = await s3.getObject({
    Key,
  }).promise()

  return JSON.parse(s3Object.Body.toString())
}

const upload = (Key, Body) => s3.upload({
  Key,
  Body: JSON.stringify(Body),
}).promise()

const uploadHashes = async (hashes) => {

  if (hashes && hashes.length === 0) {
    uniquerEvent("uploading", "early exit", { length: 0 })
    return hashes
  }
  const Key = "uniquer/hashes.json"

  uniquerEvent("uploading", "started", { key: Key })
  await upload(Key, JSON.stringify(hashes)).then(
    () => uniquerEvent("uploading", "finished", { key: Key }),
  )

  return hashes
}

const uploadResults = async (results, url) => {
  const Key = `uniquer/results/${url}.json`

  uniquerEvent("uploading", "started", { key: Key })
  await upload(Key, JSON.stringify(results)).then(
    () => uniquerEvent("uploading", "finished", { key: Key }),
  )

  return results
}

module.exports = {
  uploadHashes,
  uploadResults,
  loadFromS3,
}
