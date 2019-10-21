const AWS = require('aws-sdk')

const { lambdaEvent } = require('../common/log')

const lambda = new AWS.Lambda({
  region: 'eu-central-1',
  httpOptions: {
    timeout: 900000,
  },
})

const invokeLambda = async (FunctionName, payload) => {
  lambdaEvent('invoke', FunctionName, { payload: Object.keys(payload) })
  const res = await lambda.invoke({
    FunctionName,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify(payload),
  })
    .promise()
  lambdaEvent('invoke_end', FunctionName, { payload: Object.keys(payload) })
  return res
  // TODO: refactor
}

module.exports = {
  invokeLambda,
}
