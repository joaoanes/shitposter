const threadEvent = (eventName, eventValue, dimensions) => {
  event(`thread_${eventName}`, eventValue, 'none', dimensions)
}

const puppeteerEvent = (eventName, eventValue, dimensions) => {
  event(`puppeteer_${eventName}`, eventValue, 'none', dimensions)
}

const lambdaEvent = (eventName, eventValue, dimensions) => {
  event(`lambda_${eventName}`, eventValue, 'none', dimensions)
}

const submitEvent = (eventName, eventValue, dimensions) => {
  event(`submit_${eventName}`, eventValue, 'none', dimensions)
}

const postEvent = (eventName, eventValue, dimensions) => {
  event(`post_${eventName}`, eventValue, 'none', dimensions)
}

const event = (name, value, unit, dimensions) => {
  generic('event', name, value, unit, dimensions)
}

const generic = (type, name, value, unit, dimensions) => {
  console.warn(JSON.stringify({ type,
    payload: {
      name,
      value,
      unit,
      dimensions,
      timestamp: (new Date()).getTime(),
    },
  }))

  return false
}

module.exports = {
  threadEvent,
  lambdaEvent,
  postEvent,
  submitEvent,
  puppeteerEvent,
}
