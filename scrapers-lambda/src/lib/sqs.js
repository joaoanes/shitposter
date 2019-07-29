const AWS = require('aws-sdk')
const { sqsEvent } = require('./log')

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const sendMessage = async (queueUrl, message) => {
  sqsEvent('send', 'start', { queueUrl })

  const res = await sqs.sendMessage({
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl,
  }).promise()

  sqsEvent('send', 'end', { queueUrl, message })

  return res
}

module.exports = {
  sendMessage,
}
