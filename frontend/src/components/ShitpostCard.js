import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Card, { CardActions } from 'material-ui/Card'
import { Paper, Divider, Button, Tooltip } from 'material-ui'
import IconButton from 'material-ui/IconButton'
import red from 'material-ui/colors/red'
import { Fullscreen } from 'material-ui-icons'
import Share from 'material-ui-icons/Share'
import { compose, mapProps, withState } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import AnimateHeight from 'react-animate-height'

import RatingButton from './RatingButton'

const styles = theme => ({
  card: {
    minWidth: 600,

    overflow: 'visible',
    marginTop: 20,
    transition: 'height 0.5s ease',
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

class ShitpostCard extends React.Component {
  props: {
    ratePost: () => void,
    shitpost: Object,
    fullscreen: boolean,
    rated: boolean,
    isRating: boolean,
    setFullscreen: (fullscreen : boolean) => void,
  }

  handleClick = () => {
    this.props.setFullscreen(!this.props.fullscreen)
  }

  render () {
    const { classes, ratePost, shitpost, rated, isRating, fullscreen } = this.props
    let TypeRenderer

    try {
      TypeRenderer = require('./renderers/' + shitpost.type.toLowerCase()).default
    } catch (e) {
      TypeRenderer = require('./renderers/default.js').default
    }

    return (
      <AnimateHeight
        duration={500}
        height='auto'
        style={fullscreen ? {} : { maxWidth: '80%' }}
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
              <div style={fullscreen ? { width: '100%', height: 'auto', maxWidth: 1200 } : { maxHeight: 300, overflow: 'hidden' }} >
                <TypeRenderer
                  fullscreen={fullscreen}
                  shitpost={shitpost}
                />
              </div>
              <Divider style={{ height: 2, backgroundColor: colorTypes[this.props.shitpost.type] }} />
              {
                fullscreen && (
                  <div style={{ paddingTop: 5, paddingBottom: 5, height: 20, backgroundColor: 'black' }}>
                    <a
                      style={{ textAlign: 'center', display: 'block', color: 'white' }}
                      href={shitpost.url}
                    >Source link</a>
                    <Divider style={{ height: 2, marginTop: 5, backgroundColor: colorTypes[this.props.shitpost.type] }} />
                  </div>
                )
              }
              <Tooltip
                id='tooltip-fab'
                className={classes.fab}
                title={`Make it ${fullscreen ? 'smaller' : 'bigger'}!`}
              >
                <Button
                  variant='fab'
                  aria-label='Fullscreen'
                  style={{ position: 'absolute', bottom: -25, right: 20 }}
                  onClick={this.handleClick}
                >
                  <Fullscreen />
                </Button>
              </Tooltip>
            </div>
            <CardActions
              className={classes.actions}
              disableActionSpacing
            >
              <RatingButton
                ratePost={ratePost}
                shitpost={shitpost}
                fullscreen={fullscreen}
                rated={rated}
                isRating={isRating}
              />
              <Tooltip title='Get share link!'>
                <IconButton aria-label='Share'>
                  <a
                    target='_blank'
                    style={{ color: 'rgba(0, 0, 0, 0.54)', height: 24 }}
                    href={`/${shitpost.id}`}
                  ><Share /></a>
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </div>
      </AnimateHeight>
    )
  }
}

ShitpostCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default compose(
  withStyles(styles),
  withState('fullscreen', 'setFullscreen', ({ fullscreen }) => fullscreen || false),
)(ShitpostCard)
