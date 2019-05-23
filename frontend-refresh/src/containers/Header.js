import React, { Component } from 'react'
import Giphy from '../components/Giphy'

const { REACT_APP_TAG, REACT_APP_COMMIT } = process.env

export default class Root extends Component {
  render () {
    return (
      <div style={styles.header}>
        <div style={styles.banner}/>
        <div style={styles.titleContainer}>
          <span style={styles.title}>Shitpost.network</span>
          { REACT_APP_TAG && REACT_APP_COMMIT && <span style={styles.subTitle}>{`${REACT_APP_TAG}-${REACT_APP_COMMIT.substr(0, 8)}`}</span> }
        </div>
      </div>
    )
  }
}

const styles = {
  banner: {
    backgroundColor: 'black',
    objectFit: 'bottom',
    backgroundImage: "url(https://source.unsplash.com/1500x120/?vaporwave)",
    height: 100,
  },
  header: {
    paddingTop: 15,
    zIndex: 100,
    height: 90,
    width: '100%',
    position: 'relative',
  },
  titleContainer: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

  },
  title: {
    color: 'white',
    fontWeight: 800,
    backgroundColor: 'rgba(100,100,100,0.5)',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 15,
    marginTop: 20,
    paddingBottom: 15,
    boxSizing: 'content-box',
    border: 'none',
    font: 'normal 90px/1 "Monoton", Helvetica, sans-serif',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    textShadow: '0 0 10px rgb(255,255,255), 0 0 20px rgb(255,255,255), 0 0 30px rgb(255,255,255), 0 0 40px darkorange, 0 0 70px darkorange, 0 0 80px darkorange, 0 0 100px darkorange, 0 0 150px darkorange',
    fontFamily: 'Cedarville Cursive, sans-serif',
  },
  subTitle: {
    color: 'white', // aha
    fontSize: 20,
    textShadow: '1px 1px black',
    position: 'absolute',
    bottom: -15,
  },
}
