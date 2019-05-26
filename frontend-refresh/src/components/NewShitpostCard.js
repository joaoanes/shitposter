import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import { Button, Tooltip, Chip, CircularProgress } from '@material-ui/core/'
import TextField from '@material-ui/core/TextField'
import { Add } from '@material-ui/icons'
import { compose, withState } from 'recompose'
import { toast } from 'react-toastify'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const materialStyles = theme => ({
  card: {
    width: 600,
    overflow: 'visible',
    marginTop: 20,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
})

class ShitpostCard extends React.Component {
  props: {
    addShitpost: {variables: {url: String, name: String}},
    url: String,
    name: String,
    inputTimeout: Object,
    validInput: boolean,
    canRender: boolean,
    focused: boolean,
    loading: boolean,
    setInputTimeout: (timeout : Object) => void,
    setFocused: (bool : boolean) => void,
    setLoading: (bool : boolean) => void,
    setValidInput: (bool : boolean) => void,
    setCanRender: (bool : boolean) => void,
    setUrl: (url : String) => void,
  }

  state = {
    fullscreen: false,
  }

  handleClick = () => {
    const { addShitpost, url, name, setLoading } = this.props
    setLoading(true)
    addShitpost({ variables: {
      url, name,
    } })
      .then(() => {
        setLoading(false)
        toast('Shitpost created ❤️', { type: toast.TYPE.SUCCESS, autoClose: 2000 })
        this.changeAndValidateURL({ target: { value: '' } })
      })
      .catch((err) => console.log(err) || setLoading(false) || toast('There was an error when submitting your post :(', { type: toast.TYPE.ERROR }))
  }

  changeAndValidateURL = ({ target: { value } } : {target: { value : String}}) => {
    if (
      value.match(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/
      )
    ) {
      clearTimeout(this.props.inputTimeout)
      this.props.setInputTimeout(
        setTimeout(() => {
          fetch(value)
            .then(() => {
              this.props.setValidInput(true)
              this.props.setCanRender(true)
            })
            .catch(() => {
              this.props.setValidInput(true)
            })
        }, 1500)
      )
    } else {
      this.props.setValidInput(false)
      this.props.setCanRender(false)
    }
    this.props.setUrl(value)
  }

  render () {
    const { classes, validInput, url, canRender, focused, loading } = this.props
    return (
      <div>
        <Card className={classes.card}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ transition: 'opacity 0.5s ease', marginTop: 10, fontSize: 30, opacity: url ? 0 : 1 }}>Add your shitpost!</span>
            </div>

            <div style={{ height: canRender ? 200 : 100, transition: 'height 0.75s ease-in', overflow: 'hidden', flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >

              <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
                { canRender ? (
                  <iframe
                    onLoad={this.onLoad}
                    style={{ filter: 'grayscale(100)', border: 0, width: '100%', height: '100%' }}
                    src={url}
                  />
                ) : <div /> }
              </div>
              <div style={{ padding: 10, backgroundColor: 'white', zIndex: 1 }}>
                <TextField
                  label='Put URL here!'
                  placeholder="http:// <anything but don't forget the http please!!!>"
                  className={classes.textField}
                  value={url}
                  onChange={this.changeAndValidateURL}
                  onFocus={() => this.props.setFocused(true)}
                  onBlur={() => this.props.setFocused(false)}
                  margin='normal'
                  fullWidth
                />
              </div>
            </div>
            <Tooltip
              id='tooltip-fab'
              title='Add shitpost!'
            >
              <div style={styles.buttonWrapper}>
                <Button
                  color={validInput ? 'primary' : 'secondary'}
                  disabled={!validInput}
                  variant='fab'
                  aria-label='Add to favorites'
                  style={{ position: 'absolute', bottom: -25, right: 20 }}
                  onClick={this.handleClick}
                >
                  <Add />
                  {loading && <CircularProgress style={styles.buttonProgress} />}
                </Button>

              </div>
            </Tooltip>
          </div>
          <div style={{ ...styles.supportedContainer, ...(focused ? { height: 'auto' } : { height: 0 }) }}>
            <div style={styles.supportedTitle}>We currently support the following types of content:</div>
            <div style={styles.supportedTypesContainer}>
              <Chip label='.png links' />
              <Chip label='jpg/.jpeg links' />
              <Chip label='gif (hard g) links' />
              <Chip label='webm links' />
              <Chip label='mov links' />
              <Chip label='avi links' />
              <Chip label='mp4 links' />
              <Chip label='twitter tweet links' />
              <Chip label='youtube links' />
              <Chip label='any webpage' />
            </div>
          </div>
          <CardActions
            className={classes.actions}
            disableActionSpacing
          />
        </Card>
      </div>
    )
  }
}

ShitpostCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

const styles = {
  supportedTypesContainer: {
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  supportedType: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
  },
  supportedContainer: {
    margin: 15,
    overflow: 'hidden',
  },
  supportedTitle: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 15,
    fontWeight: 500,
  },
  buttonWrapper: {
    position: 'relative',
  },
  buttonProgress: {
    color: 'green',
    position: 'absolute',
    width: '120%',
    height: '120%',
    zIndex: 1,
  },
}

export default compose(
  withStyles(materialStyles),
  withState('name', 'setName', ''),
  withState('url', 'setUrl', ''),
  withState('validInput', 'setValidInput', ''),
  withState('canRender', 'setCanRender', false),
  withState('focused', 'setFocused', false),
  withState('inputTimeout', 'setInputTimeout', null),
  withState('loading', 'setLoading', false),
  graphql(gql`
  mutation addPost($url: String!, $name: String) {
    addShitpost(url: $url, name: $name) {
      id
      url
      type
      name
    }
  }
  `, {
    name: 'addShitpost',
    options: {
      refetchQueries: ['getAfterShitposts'],
    },
  }),
)(ShitpostCard)
