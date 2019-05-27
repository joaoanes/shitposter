import React from 'react'
import {startCase} from 'lodash'

export default ({ pressed, children, onClick, color: backgroundColor }) => (
  <input
    onClick={onClick}
    type="button"
    value={startCase(children)}
    style={{ ...style, backgroundColor, opacity: pressed ? 1 : 0.2, color: pressed ? "white" : "black" }}
  ></input>
)


const style = {
  padding: 10,
  opacity: 1,
  color: 'white',
  fontSize: 12,
  fontWeight: 100,
  textShadow: '1px 1px black',
}
