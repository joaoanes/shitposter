const AWS = require('aws-sdk')
const { sqsEvent } = require('./log')

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const sendMessage = async (queueUrl, message, MessageDeduplicationId = null) => {
  sqsEvent('send', 'start', { queueUrl, MessageDeduplicationId })
  let res
  try {
    res = await sqs.sendMessage({
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl,
      MessageDeduplicationId,
    }).promise()
  } catch (e) {
    sqsEvent('send', 'error', { queueUrl, message, error: e.toString() })
    return e
  }

  sqsEvent('send', 'end', { queueUrl, message, res })

  return res
}

module.exports = {
  sendMessage,
}
