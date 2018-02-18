import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Card, { CardActions } from 'material-ui/Card'
import { Button, Tooltip } from 'material-ui'
import TextField from 'material-ui/TextField'
import {Add} from 'material-ui-icons'
import { compose, withState } from 'recompose'

const styles = theme => ({
  card: {
    minWidth: 600,
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
    newPost: {variables: {url: String, name: String}},
    url: String,
    name: String,
    inputTimeout: Object,
    validInput: boolean,
    canRender: boolean,
    setInputTimeout: (timeout : Object) => void,
    setValidInput: (bool : boolean) => void,
    setCanRender: (bool : boolean) => void,
    setUrl: (url : String) => void,
  }

  state = {
    fullscreen: false
  }

  handleClick = () => {
    const {newPost, url, name} = this.props
    newPost({variables: {
      url, name
    }})
  }

  changeAndValidateURL = ({target: {value}} : {target: { value : String}}) => {


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

  render() {
    const { classes, validInput, url, canRender } = this.props

    return (
      <div>
        <Card className={classes.card}>
          <div style={{position: 'relative'}}>
            <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <span style={{transition: 'opacity 0.5s ease', marginTop: 10, fontSize: 30, opacity: url ? 0 : 1}}>Add your shitpost!</span>
            </div>

            <div style={{height: canRender ? 200 : 100, transition: 'height 0.75s ease-in', overflow: 'hidden', flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >

              <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0}}>
                { canRender ? <iframe onLoad={this.onLoad} style={{filter: 'grayscale(100)', border: 0, width: '100%', height: '100%'}} src={url} /> : <div /> }
              </div>
              <div style={{padding: 10, backgroundColor: 'white', zIndex: 1}}>
                <TextField
                  label="Put URL here!"
                  placeholder="http:// <anything but don't forget the http please!!!>"
                  className={classes.textField}
                  value={url}
                  onChange={this.changeAndValidateURL}
                  margin="normal"
                  fullWidth
                />
              </div>
            </div>
            <Tooltip id="tooltip-fab" title="Add shitpost!">
              <div>
                <Button color={validInput ? 'primary' : 'secondary'} disabled={!validInput} variant="fab" aria-label="Add to favorites" style={{position: 'absolute', bottom: -25, right: 20}} onClick={this.handleClick}>
                  <Add />
                </Button>
              </div>
            </Tooltip>
          </div>
          <CardActions className={classes.actions} disableActionSpacing>

          </CardActions>
        </Card>
      </div>
    )
  }
}

ShitpostCard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default compose(
  withStyles(styles),
  withState('name', 'setName', ''),
  withState('url', 'setUrl', ''),
  withState('validInput', 'setValidInput', ''),
  withState('canRender', 'setCanRender', false),
  withState('inputTimeout', 'setInputTimeout', null)
)(ShitpostCard)
