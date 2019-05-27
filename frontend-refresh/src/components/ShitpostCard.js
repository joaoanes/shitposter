import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import { Paper, Button, Tooltip } from '@material-ui/core'
import { Fullscreen } from '@material-ui/icons'
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
  },

  sourceContainer: {
    marginTop: 0,
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
    pointerEvents: "all",
    marginBottom: 20,
    marginTop: "auto",
    marginLeft: "auto",
    marginRight: 20,
  }
}


class ShitpostCard extends React.PureComponent {
  props: {
    ratePost: () => void,
    shitpost: Object,
    fullscreen: boolean,
    rated: boolean,
    isRating: boolean,
    setFullscreen: (fullscreen: boolean) => void,
  }

  handleClick = () => {
    this.props.setFullscreen([this.props.shitpost.id, this.props.reportedSize])
  }

  componentDidMount() {
    console.log(this.props.shitpost.id, "mounted!")
  }

  render() {
    const { ratePost, shitpost, rated, isRating, fullscreen } = this.props
    let TypeRenderer

    console.log("rendering!", shitpost.id, this.props)

    try {
      TypeRenderer = require('./renderers/' + shitpost.type.toLowerCase()).default
    } catch (e) {
      TypeRenderer = require('./renderers/default.js').default
    }

    return (
      <div
        id={shitpost.id}
        style={{
          ...(fullscreen ? { zIndex: 1000, position: 'relative', width: 900, } : { width: 600, height: 450, }),
          marginLeft: "auto",
          marginRight: "auto",

        }}
      >

        <div onClick={fullscreen ? () => 0 : this.handleClick} onDoubleClick={fullscreen ? this.handleClick : () => 0} style={fullscreen ? { width: '100%', height: 'auto', overflow: "hidden" } : { overflow: 'hidden' }} >
          <div style={{
            ...(fullscreen ? { overflow: "hidden" } : { pointerEvents: "none", height: 450, display: 'flex'}),
            position: "relative",
            backgroundColor: "black",

          }}>
            <TypeRenderer
              fullscreen={fullscreen}
              shitpost={shitpost}
              reportSize={this.props.setReportedSize}
            />
            {fullscreen && <div style={styles.overlay}>
              <div style={styles.ratingsContainer}>
                <RatingButton
                  ratePost={ratePost}
                  shitpost={shitpost}
                  fullscreen={fullscreen}
                  rated={rated}
                  isRating={isRating}
                />
              </div>
            </div>}
          </div>
        </div>

        <Divider style={{
          backgroundColor: colorTypes[this.props.shitpost.type],
          animation: fullscreen ? this.props.shitpost.type.toLowerCase() + " 1.5s ease-in-out infinite alternate" : null
        }} />

      </div>
    )
  }
}

ShitpostCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default compose(
  withState('reportedSize', 'setReportedSize', 300),
  mapProps((props) => ({
    ...props,
    shitpost: {
      ...props.shitpost,
      originalUrl: props.shitpost.url, //the mythical hack upon a hack
      url: props.shitpost.permalink || props.shitpost.url,
    },
  }))
)(ShitpostCard)
