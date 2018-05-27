import React, { Component } from 'react'
import './App.css'
import Root from './containers/Root'
import Header from './containers/Header'
import { StickyContainer, Sticky } from 'react-sticky'
import { ToastContainer } from 'react-toastify'

class App extends Component {
  render () {
    return (
      <div className='App'>
        <StickyContainer>
          <Sticky>
            {({
              style,
            }) => (
              <div style={{ ...style, zIndex: 100 }} >
                <Header />
              </div>
            )}
          </Sticky>

          <Root />
        </StickyContainer>
        <ToastContainer autoClose={false} />
      </div>
    )
  }
}

export default App
