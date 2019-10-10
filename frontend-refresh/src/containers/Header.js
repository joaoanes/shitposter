import React, { Component } from 'react'
import { map } from 'lodash'
import { compose, withState } from 'recompose'

import ToggleButton from '../components/ToggleButton'
import colorTypes from '../stuff/colors.js'

const { REACT_APP_TAG = "uhhhh", REACT_APP_COMMIT = "5181fb910c9ad0959b4da9c3283f5f52d7360d40" } = process.env

const stopPropagation = (fun) => (event) => {event.stopPropagation(); return fun ? fun() : null}

class Root extends Component {

  changeFilter = (filter) => {
    return {
      ...this.props.filters,
      [filter]: !this.props.filters[filter]
    }
  }
  render() {
    const { extended, setExtended, filters, setFilters, currentUser, handleLogout } = this.props
    return (
      <div style={styles.header} onClick={() => setExtended(!extended)}>
        <div style={styles.banner} />
        <div style={styles.titleContainer}>
          <div style={styles.titleWrapper}>
            <span style={styles.title}>Shitpost.network</span>
            <div style={styles.subContainer}>
              {currentUser ?
                <span style={styles.subSubContainer}>
                  <span style={styles.logout} onClick={stopPropagation(handleLogout)}>Hi {currentUser.name}! 👋</span>
                  <span style={styles.logoutSmall} onClick={stopPropagation(handleLogout)}>(click me to log out)</span>
                </span> :
                <a href={"https://telegram.me/anes_v1_bot"} onClick={stopPropagation()} style={styles.login}>Register and login via telegram</a>
              }
              {REACT_APP_TAG && REACT_APP_COMMIT && <span style={styles.subTitle}>{`${REACT_APP_TAG}-${REACT_APP_COMMIT.substr(0, 8)}`}</span>}
            </div>
          </div>
        </div>
        <div style={{ ...styles.filterContainer, height: extended ? 60 : 0 }}>
          <div style={styles.filterWrapper}>
            {
              map(filters, (value, filter) => (
                <ToggleButton
                  pressed={value}
                  key={filter}
                  color={getColor(filter)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilters(this.changeFilter(filter))
                  }}
                >{filter}</ToggleButton>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

const getColor = (type) => colorTypes[type.toUpperCase()]



const styles = {
  banner: {
    backgroundColor: 'black',
    objectFit: 'bottom',
    //backgroundImage: "url(https://source.unsplash.com/1500x120/?vaporwave)",
    height: 110,
  },
  header: {
    paddingTop: 15,
    zIndex: 100,
    height: 120,
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
    pointerEvents: "none",
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontWeight: 800,
    //backgroundColor: 'rgba(100,100,100,0.5)',
    paddingLeft: 25,
    paddingRight: 25,
    fontSize: 120,
    paddingTop: 15,
    marginTop: 30,
    paddingBottom: 15,
    boxSizing: 'content-box',
    border: 'none',
    font: 'normal 90px/1 "Monoton", Helvetica, sans-serif',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    textShadow: '0 0 10px rgb(255,255,255), 0 0 20px rgb(255,255,255), 0 0 30px rgb(255,255,255), 0 0 40px darkorange, 0 0 70px darkorange, 0 0 80px darkorange, 0 0 100px darkorange, 0 0 150px darkorange',
    fontFamily: 'Cedarville Cursive, sans-serif',
    color: "white",
  },
  subTitle: {
    color: 'white', // aha
    fontSize: 14,
    alignSelf: "flex-end",
    bottom: 15,
    position: "relative",
    textShadow: '0 0 10px rgb(255,255,255), 0 0 20px rgb(255,255,255), 0 0 30px rgb(255,255,255), 0 0 40px darkorange, 0 0 70px darkorange, 0 0 80px darkorange, 0 0 100px darkorange, 0 0 150px darkorange',
    fontFamily: 'Consolas, sans-serif',
  },
  filterContainer: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
    overflow: "hidden",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutSmall: {
    pointerEvents: "all",
    cursor: "pointer",
    color: 'white', // aha
    fontSize: 8,
    bottom: 15,
    position: "relative",
    textShadow: '0 0 10px rgb(255,255,255), 0 0 20px rgb(255,255,255), 0 0 30px rgb(255,255,255), 0 0 40px darkorange, 0 0 70px darkorange, 0 0 80px darkorange, 0 0 100px darkorange, 0 0 150px darkorange',
    fontFamily: 'Consolas, sans-serif',
  },
  logout: {
    color: 'white', // aha
    fontSize: 12,
    bottom: 15,
    position: "relative",
    fontFamily: 'Consolas, sans-serif',
  },
  login: {
    pointerEvents: "all",
    color: 'white', // aha
    fontSize: 12,
    alignSelf: "flex-end",
    bottom: 15,
    position: "relative",
    textShadow: '0 0 10px rgb(255,255,255), 0 0 20px rgb(255,255,255), 0 0 30px rgb(255,255,255), 0 0 40px darkorange, 0 0 70px darkorange, 0 0 80px darkorange, 0 0 100px darkorange, 0 0 150px darkorange',
    fontFamily: 'Consolas, sans-serif',
  },
  subContainer: {
    display: "flex",
    justifyContent: 'space-between',
    top: -10,
    position: "relative",
  },
  subSubContainer: {
    display: "flex",
    alignItems: 'center',
    flexDirection: "column",
  }
}

export default compose(
  withState("extended", "setExtended", false),
)(Root)
