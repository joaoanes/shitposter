import React, { Component } from 'react'
import { map } from 'lodash'
import { compose, withState } from 'recompose'

import { FilterList } from '@material-ui/icons'

import ToggleButton from '../components/ToggleButton'
import colorTypes from '../stuff/colors.js'

const { REACT_APP_TAG = "uhhhh", REACT_APP_COMMIT = "UHHHHH" } = process.env

class Root extends Component {

  changeFilter = (filter) => {
    return {
      ...this.props.filters,
      [filter]: !this.props.filters[filter]
    }
  }
  render() {
    const { extended, setExtended, filters, setFilters } = this.props
    return (
      <div style={styles.header} onClick={() => setExtended(!extended)}>
        <div style={styles.banner}>
          <FilterList style={{color: "white", fontSize: 70, marginLeft: 350, marginTop: 25}} />
          </div>
        <div style={styles.titleContainer}>
          <div style={styles.titleWrapper}>
            <span style={styles.title}>Shitpost.network</span>
            {REACT_APP_TAG && REACT_APP_COMMIT && <span style={styles.subTitle}>{`${REACT_APP_TAG}-${REACT_APP_COMMIT.substr(0, 8)}`}</span>}
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
    "-webkit-animation": "neon5 1.5s ease-in-out infinite alternate",
    "-moz-animation": "neon5 1.5s ease-in-out infinite alternate",
    "animation": "neon5 1.5s ease-in-out infinite alternate"
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
  }
}

export default compose(
  withState("extended", "setExtended", false),
)(Root)
