import React, { Component } from 'react'
import './App.css'
import Root from './containers/Root'
import Header from './containers/Header'
import { StickyContainer, Sticky } from 'react-sticky'
import { ToastContainer } from 'react-toastify'
import AutoSizer from "react-virtualized-auto-sizer"

class App extends Component {
  render () {
    return (
      <div className='App'>
        <AutoSizer>
          {
            ({width, height}) => (
              <div style={{width, height}} aaaa="fudge" >
                <div style={styles.headerContainer}>
                  <Header />
                </div>


                <Root />


                <ToastContainer autoClose={false} />
              </div>
            )
          }
        </AutoSizer>
      </div>
    )
  }
}

const styles = {
  headerContainer: {
    position: "absolute",
    width: "100%",
    height: 200,
    top: 0,
  }
}

export default App
