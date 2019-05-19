import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Divider, Button, Tooltip } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import red from '@material-ui/core/colors/red'
import { Fullscreen } from '@material-ui/icons'
import Share from '@material-ui/icons/Share'
import { compose, mapProps, withState } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import AnimateHeight from 'react-animate-height'
import _ from "lodash"

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
  }
})

const colorTypes = {
  WEBPAGE: 'grey',
  TWEET: '#00aced',
  IMAGE: 'purple',
  YOUTUBE: 'red', // ugh
}

class PlaceholderCard extends React.PureComponent {

  render() {
    const { classes } = this.props

    return (
      <Card
        className={classes.card}
      >
        <div style={{ position: 'relative' }}>

          <div style={{ backgroundColor: 'grey' ,width: '100%', height: 300, maxWidth: 1200, display: "flex", alignItems: 'center', justifyContent: 'center' }} >
            <CircularProgress style={{color: 'white'}}/>
          </div>
          <Divider style={{ height: 2, backgroundColor: 'green' }} />


          <Button
            variant='fab'
            aria-label='Fullscreen'
            style={{ position: 'absolute', bottom: -25, right: 20 }}
            onClick={this.handleClick}
          >
            <Fullscreen />
          </Button>

        </div>
        <CardActions
          className={classes.actions}
          disableActionSpacing
        >

          <Tooltip title='Get share link!'>
            <IconButton aria-label='Share'>
              <a
                target='_blank'
                style={{ color: 'rgba(0, 0, 0, 0.54)', height: 24 }}
              ><Share /></a>
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

    )
  }
}

PlaceholderCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default compose(
  withStyles(styles),
)(PlaceholderCard)
