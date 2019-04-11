const uniquerEvent = (eventName, eventValue, dimensions) => {
  event(`uniquer_${eventName}`, eventValue, "none", dimensions)
}

const event = (name, value, unit, dimensions) => {
  generic("event", name, value, unit, dimensions)
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
}

module.exports = {
  uniquerEvent,
}
