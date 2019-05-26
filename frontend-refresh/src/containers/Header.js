import React, { Component } from 'react'
import { map } from 'lodash'
import { compose, withState } from 'recompose'

import { FilterList } from '@material-ui/icons'

import ToggleButton from '../components/ToggleButton'

const { REACT_APP_TAG, REACT_APP_COMMIT } = process.env

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
          <span style={styles.title}>Shitpost.network</span>
          {REACT_APP_TAG && REACT_APP_COMMIT && <span style={styles.subTitle}>{`${REACT_APP_TAG}-${REACT_APP_COMMIT.substr(0, 8)}`}</span>}
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

const colorTypes = {
  WEBPAGE: 'grey',
  TWEET: '#00aced',
  IMAGE: 'purple',
  YOUTUBE: 'red', // ugh
  FACEBOOK_POST: "#3b5998",
  VIDEO: "orange",
  MUTE_VIDEO: "#3254ff",
  AMP: 'black',
  MEDIUM_POST: "green",
  ANIMATED_IMAGE: "#12ff54",
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
    pointerEvents: "none",
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
