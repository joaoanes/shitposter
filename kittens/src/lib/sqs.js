const AWS = require('aws-sdk')
const { sqsEvent } = require('./log')

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

const sendMessage = async (queueUrl, message, MessageDeduplicationId = null, counter = 0) => {
  if (counter > 4) {
    throw new Error('Request counter too high!')
  }
  sqsEvent('send', 'start', { queueUrl, MessageDeduplicationId })
  let res
  let msgParameters = {
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl,
  }

  if (queueUrl.indexOf('.fifo') !== -1) {
    msgParameters['MessageDeduplicationId'] = MessageDeduplicationId
    msgParameters['MessageGroupId'] = 'same-for-all!'
  }
  try {
    res = await sqs.sendMessage(msgParameters).promise()
  } catch (e) {
    if (e.toString().indexOf('RequestThrottled') !== -1) {
      sqsEvent('send', 'throttle', { queueUrl, MessageDeduplicationId })
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(sendMessage(queueUrl, message, MessageDeduplicationId, counter + 1))
        }, 5000)
      })
    }
    sqsEvent('send', 'error', { queueUrl, msgParameters, error: e.toString() })
    return e
  }

  sqsEvent('send', 'end', { queueUrl, message, res })

  return res
}

module.exports = {
  sendMessage,
}
