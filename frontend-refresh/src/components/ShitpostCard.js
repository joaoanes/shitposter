import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { compose, mapProps, withState } from 'recompose'
import MediaQuery from 'react-responsive';
import _ from "lodash"
import colorTypes from '../stuff/colors.js'

import RatingButton from './RatingButton'

const Divider = ({ style }) => (<div
  style={{
    ...style,
    width: "100%",
    height: 5,
  }}
></div>)

const styles = {
  card: {
    minWidth: 600,
    maxWidth: "800px",
    marginLeft: "auto",
    marginRight: "auto",
    overflow: 'visible',
    marginTop: 20,
    transition: 'height 0.5s ease',
    maxHeight: "100vh"
  },

  sourceContainer: {
    marginTop: 0,
  },

  gradient: {
    background: "linear-gradient(rgba(255,255,255,0) 80%, rgba(255,255,255,0.4))",
    width: "100%",
    height: "100%",
    pointerEvents: 'none',
  },

  overlay: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
    display: "flex",
    pointerEvents: "none",
  },

  ratingsContainer: {
    transition: 'all 0.25s ease 0s',
    pointerEvents: "all",
    marginBottom: 20,
    marginTop: "auto",
    marginLeft: "auto",
    marginRight: 20,
  }
}

let reported = {}

class ShitpostCard extends React.PureComponent {
  props: {
    ratePost: () => void,
    shitpost: Object,
    fullscreen: boolean,
    rated: boolean,
    isRating: boolean,
    setFullscreen: (fullscreen: boolean) => void,
  }

  state = {
    loading: true,
  }

  handleClick = () => {
    this.props.setFullscreen([this.props.shitpost.id, this.props.reportedSize])
  }

  componentDidMount() {
    console.log(this.props.shitpost.id, "mounted!")

    this.setState({
      loadingTimeout: setTimeout(() => this.setState({ loading: false }), 250)
    })
  }

  componentWillUnmount() {
    clearTimeout(this.state.loadingTimeout)
  }

  setSizeAndRerender = (size) => {
    if (Object.keys(reported).indexOf(this.props.shitpost.id) !== -1) {
      return this.props.setReportedSize(reported[this.props.shitpost.id])
    }
    this.props.setReportedSize(size)
    reported = {...reported, [this.props.shitpost.id]: size}
    if (this.props.fullscreen) {
      console.log("setting size to", size, this.props.fullscreen, reported)
      this.props.setFullscreen([this.props.shitpost.id, this.props.reportedSize], false)
    }
  }

  render() {
    const { ratePost, shitpost, rated, isRating, fullscreen } = this.props
    const { loading } = this.state
    let TypeRenderer

    console.log("rendering!", shitpost.id, this.props, this.state)

    try {
      TypeRenderer = require('./renderers/' + shitpost.type.toLowerCase()).default
    } catch (e) {
      TypeRenderer = require('./renderers/default.js').default
    }

    if (loading) {
      TypeRenderer = () => (<div />)
    }

    return (
      <div
        id={shitpost.id}
        style={{
          ...(fullscreen ? { zIndex: 1000, position: 'relative', width: 900, } : { width: 600, height: 250, }),
          marginLeft: "auto",
          marginRight: "auto",
          transition: 'all 0.25s ease 0s',

        }}
      >

        <div onClick={fullscreen ? () => 0 : this.handleClick} onDoubleClick={fullscreen ? this.handleClick : () => 0} style={fullscreen ? { width: '100%', height: 'auto', overflow: "hidden" } : { overflow: 'hidden' }} >
          <div style={{
            ...(fullscreen ? { overflow: "hidden" } : { pointerEvents: "none", height: 250, display: 'flex'}),
            position: "relative",
            backgroundColor: "black",
            transition: 'all 0.25s ease 0s',

          }}>
            <TypeRenderer
              fullscreen={fullscreen}
              shitpost={shitpost}
              reportSize={this.setSizeAndRerender}
            />
            <div style={styles.overlay}>
              {fullscreen ?
              <div style={styles.ratingsContainer}>
                <RatingButton
                  ratePost={ratePost}
                  shitpost={shitpost}
                  fullscreen={fullscreen}
                  rated={rated}
                  isRating={isRating}
                />
              </div>
              : <div style={styles.gradient} />
            }
            </div>
          </div>
        </div>

        <Divider style={{
          backgroundColor: colorTypes[this.props.shitpost.type],
        }} />

      </div>
    )
  }
}

ShitpostCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default compose(
  withState('reportedSize', 'setReportedSize', 301),
  mapProps((props) => ({
    ...props,
    shitpost: {
      ...props.shitpost,
      originalUrl: props.shitpost.url, //the mythical hack upon a hack
      url: props.shitpost.permalink || props.shitpost.url,
    },
  }))
)(ShitpostCard)
