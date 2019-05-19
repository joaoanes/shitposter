const axios = require("axios");
const fs = require("fs-extra")
const { filter } = require("lodash")
const execa = require("execa")
const { withFile, setGracefulCleanup } = require("tmp-promise")

const { loadFromS3, uploadHashes, uploadResults } = require("../src/s3")

setGracefulCleanup()

const {
  BACKUP_SECONDS,
  IM_THRESHOLD = 20,
} = process.env

class Uniquer {
  constructor() {
    return (async () => {
      console.warn("getting values from s3")

      this.fileHashes = await loadFromS3("/uniquer/hashes.json").catch(() => [])
      console.warn(`imported ${this.fileHashes.length} hashes to memory`)

      setInterval(
        this.backup.bind(this),  // fucking javascript
        BACKUP_SECONDS * 1000,
      )

      return this
    })
  }

  backup() {
    uploadHashes(this.fileHashes)
  }

  addHash(hash, url) {
    this.fileHashes = [...this.fileHashes, { hash, url }]
    console.log(`added hash for ${url}`)
  }

  async checkUniqueness(contentUrl) {
    const req = await axios.get(
      contentUrl,
      {
        responseType: "arraybuffer",
      },
    )

    let fileHash
    debugger

    await withFile(async ({ path, fd }) => {
      await fs.writeFile(fd, req.body)
      debugger
      const { all } = await execa(`${__dirname}/../im/phashconvert`, [path])
      debugger
      fileHash = all
    })
    debugger
    const values = await Promise.all(
      this.fileHashes.map(async ({hash, url}) => {
        const {all: percentage} = await execa(`${__dirname}/../im/phashcompare`, [hash, fileHash])
        return {url, hash, percentage: Number.parseFloat(percentage)}
      }),
    )

    this.addHash(fileHash, contentUrl)

    const filteredValues = filter(values, ({percentage}) => percentage < IM_THRESHOLD)
    if (filteredValues.length !== 0) {
      console.log(`matched ${contentUrl}`)
      uploadResults(filteredValues, contentUrl)
      return false
    }

    return true
  }
}

module.exports = {
  instance: new Uniquer(),
}
