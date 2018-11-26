/* eslint-disable no-shadow */

import React, { Fragment } from 'react'
import reactCSS, { hover } from 'reactcss'
import { Badge, withStyles } from 'material-ui'
import { compose, withProps } from 'recompose'

const active = Component => class Active extends React.Component {
    state = { active: false }
    handleMouseDown = () => this.setState({ active: true })
    handleMouseUp = () => this.setState({ active: false })

    render () {
      return (
        <div
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
        >
          <Component
            {...this.props}
            {...this.state}
          />
        </div>
      )
    }
}

export const GithubSelectorEmoji = ({ icon, label, onSelect, hover, badge, id }) => {
  const styles = reactCSS({
    'default': {
      wrap: {
        padding: '5px',
        position: 'relative',
      },
      hack: {
        display: 'flex',
        alignItems: 'center',
        distributeContent: 'center',

      },
      icon: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        transformOrigin: 'bottom',
        cursor: 'pointer',
        transition: '200ms transform cubic-bezier(0.23, 1, 0.32, 1)',
      },
      label: {
        position: 'absolute',
        top: '-22px',
        background: 'rgba(0,0,0,.8)',
        borderRadius: '14px',
        color: '#fff',
        fontSize: '11px',
        padding: '4px 7px 3px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: '200ms transform cubic-bezier(0.23, 1, 0.32, 1)',
        opacity: '0',
      },
    },
    'hover': {
      icon: {
        transform: 'scale(1.3)',
      },
      label: {
        transform: 'translateX(-50%) translateY(-10px)',
        opacity: '1',
      },
    },
  }, { hover })

  const handleClick = () => {
    onSelect && onSelect(id)
  }

  const Wrapper = badge ? compose(
    withProps({
      style: { margin: 1 },
      badgeContent: badge,
      color: 'primary',
    })
  )(Badge) : Fragment

  return (
    <div style={styles.wrap}>
      <Wrapper >
        <div
          style={{ ...styles.icon, opacity: 1 }}
          onClick={handleClick}
        >
          <div style={styles.hack}>
            {icon}
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

export default hover(active(GithubSelectorEmoji))
