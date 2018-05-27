import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Card, { CardActions } from 'material-ui/Card'
import { Badge, Paper, Divider, Button, Tooltip } from 'material-ui'
import IconButton from 'material-ui/IconButton'
import red from 'material-ui/colors/red'
import FavoriteIcon from 'material-ui-icons/Favorite'
import { Fullscreen } from 'material-ui-icons'
import Share from 'material-ui-icons/Share'
import { compose, mapProps, withState } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import AnimateHeight from 'react-animate-height'

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

    const heartColor = rated ? 'red' : (isRating ? 'rgba(200,30,30,0.25)' : null)

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
            <div style={{ position: 'relative', overflow: 'hidden' }}>
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
              <Tooltip title='Like shitpost!'>
                <IconButton
                  aria-label='Heart'
                  onClick={ratePost}
                >
                  { fullscreen
                    ? (
                      <Badge
                        style={{ margin: 4 }}
                        badgeContent={shitpost.rating || 0}
                        color='primary'
                      >
                        <FavoriteIcon style={heartColor ? { color: heartColor } : {}} />
                      </Badge>
                    )
                    : <FavoriteIcon style={heartColor ? { color: heartColor } : {}} />
                  }
                </IconButton>
              </Tooltip>
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
  graphql(gql`
  mutation ratePost($id: ID!) {
    rateShitpost(id: $id) {
      id
      rating
      name
      permalink
      url
      type
    }
  }
  `, {
    name: 'ratePost',
    options: ({ shitpost: { id } }) => ({
      variables: {
        id,
      },
    }),
  }),
  withState('isRating', 'setIsRating', false),
  withState('rated', 'setRated', false),
  withState('fullscreen', 'setFullscreen', ({ fullscreen }) => fullscreen || false),
  mapProps((props) => {
    const ratesString = window.localStorage.getItem('rates')
    const rates = new Set(
      ratesString
        ? JSON.parse(ratesString)
        : []
    )
    return {
      ...props,
      ratePost: () => {
        if (props.rated) {
          return
        }
        props.setIsRating(true)
        return props.ratePost().then(() => {
          rates.add(props.shitpost.id)
          window.localStorage.setItem(
            'rates',
            JSON.stringify(Array.from(rates))
          )
          props.setRated(true)
        })
      },
      rated: rates.has(props.shitpost.id),
      shitpost: {
        ...props.shitpost,
        url: props.shitpost.permalink || props.shitpost.url,
      },
    }
  }),
)(ShitpostCard)
