import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import { Paper, Divider, Button, Tooltip } from '@material-ui/core'
import red from '@material-ui/core/colors/red'
import { Fullscreen } from '@material-ui/icons'
import { compose, mapProps, withState } from 'recompose'
import MediaQuery from 'react-responsive';
import _ from "lodash"

import RatingButton from './RatingButton'

const styles = theme => ({
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
  nameContainer: {
    paddingLeft: 15,
    paddingRight: 45,
    paddingTop: 15,
    paddingBottom: 10,
    fontFamily: 'Roboto',
    fontSize: '20px',
  },
  media: {
    maxHeight: 300,
  },
  actions: {
    display: 'flex',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
})

const colorTypes = {
  WEBPAGE: 'grey',
  TWEET: '#00aced',
  IMAGE: 'purple',
  YOUTUBE: 'red', // ugh
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
    const { classes, ratePost, shitpost, rated, isRating, fullscreen } = this.props
    let TypeRenderer

    console.log("rendering!", shitpost.id, this.props)

    try {
      TypeRenderer = require('./renderers/' + shitpost.type.toLowerCase()).default
    } catch (e) {
      TypeRenderer = require('./renderers/default.js').default
    }

    return (
      <div
        duration={500}
        height='auto'
        style={fullscreen ? {} : { maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div
          id={shitpost.id}
          style={fullscreen ? { zIndex: 1000, position: 'relative' } : {}}
        >
          <Card
            raised={fullscreen}
            key={shitpost.id}
            className={classes.card}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: -5, top: 20 }}>
                {
                  shitpost.name && (
                    <Paper className={classes.nameContainer}>
                      {shitpost.name}
                    </Paper>
                  )}
              </div>
              <MediaQuery query="(min-device-width: 1224px)">
                <div style={fullscreen ? { width: '100%', height: 'auto' } : { maxHeight: 300, overflow: 'hidden' }} >
                  <TypeRenderer
                    fullscreen={fullscreen}
                    shitpost={shitpost}
                    reportSize={this.props.setReportedSize}
                  />
                </div>
              </MediaQuery>
              <MediaQuery query="(max-width: 1224px)">
                <div onClick={ fullscreen ? () => 0 : this.handleClick } onDoubleClick={ fullscreen ? this.handleClick : () => 0 } style={fullscreen ? { width: '100%', height: 'auto' } : { maxHeight: 300, overflow: 'hidden' }} >
                  <div style={ fullscreen ? {} : {pointerEvents: "none"}}>
                    <TypeRenderer
                      fullscreen={fullscreen}
                      shitpost={shitpost}
                      reportSize={this.props.setReportedSize}
                    />
                  </div>
                </div>
              </MediaQuery>
              <Divider style={{ height: 2, backgroundColor: colorTypes[this.props.shitpost.type] }} />
              {
                fullscreen && (
                  <Card
                    raised={fullscreen}
                    className={classes.sourceContainer}
                  >
                    <div style={{ paddingTop: 5, paddingBottom: 5, height: 20 }}>
                      <a
                        style={{ textAlign: 'center', display: 'block', color: 'black' }}
                        href={shitpost.originalUrl}
                      >Source link</a>
                      <Divider style={{ height: 2, marginTop: 5, backgroundColor: colorTypes[this.props.shitpost.type] }} />
                    </div>
                  </Card>
                )
              }
              <MediaQuery query="(min-device-width: 1224px)">
                <Tooltip
                  id='tooltip-fab'
                  className={classes.fab}
                  title={`Make it ${fullscreen ? 'smaller' : 'bigger'}!`}
                >
                  <Button
                    variant='fab'
                    aria-label='Fullscreen'
                    style={{ position: 'absolute', bottom: -30, right: 20 }}
                    onClick={this.handleClick}
                  >
                    <Fullscreen />
                  </Button>
                </Tooltip>
              </MediaQuery>
            </div>
            <CardActions
              className={classes.actions}
              disableActionSpacing
            >
              {/* <Tooltip title='Get share link!'>
                <IconButton aria-label='Share'>
                  <a
                    target='_blank'
                    style={{ color: 'rgba(0, 0, 0, 0.54)', height: 24 }}
                    href={`/${shitpost.id}`}
                  ><Share /></a>
                </IconButton>
              </Tooltip> */}
              <RatingButton
                ratePost={ratePost}
                shitpost={shitpost}
                fullscreen={fullscreen}
                rated={rated}
                isRating={isRating}
              />

            </CardActions>
          </Card>
        </div>
      </div>
    )
  }
}

ShitpostCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default compose(
  withStyles(styles),
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
