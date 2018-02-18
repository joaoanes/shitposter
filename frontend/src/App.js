import React, { Component } from 'react'
import './App.css'
import Root from './containers/Root'
import Header from './containers/Header'
import { StickyContainer, Sticky } from 'react-sticky'

class App extends Component {
  render() {
    return (
      <div className="App">
        <StickyContainer>
          <Sticky>
            {({
              style,
            }) =>
              <div style={{...style, zIndex: 100}} >
                <Header />
              </div>
            }
          </Sticky>

          <Root />
        </StickyContainer>
      </div>
    )
  }
}

export default App
