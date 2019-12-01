import React from 'react'
import reactCSS from 'reactcss'
import { map } from 'lodash'

import FacebookSelectorEmoji from './StolenFacebookSelectorEmoji'

export const FacebookSelector = ({ iconSize, reactions, variant, onSelect, showLabels, onlyShowFirst }) => {
  const styles = reactCSS({
    'default': {
      selector: {
        backgroundColor: 'rgba(255,255,255,0.6)',

        padding: '2px',
        display: 'flex',
      },
      icon: {
        width: `${iconSize + 10}px`,
        height: `${iconSize + 10}px`,
        fontSize: `${iconSize}px`,
      },
    },
  })

  let parsedReactions = reactions
  if (onlyShowFirst) {
    parsedReactions = reactions.splice(0, 1)
  }

  return (
    <div style={styles.selector}>
      { map(parsedReactions, ({ emoji, count, id }) => (
        <div
          style={styles.icon}
          key={emoji}
        >
          <FacebookSelectorEmoji
            icon={emoji}
            onSelect={onSelect}
            badge={showLabels ? count : null}
            id={id}
          />

        </div>
      )) }
    </div>
  )
}

FacebookSelector.defaultProps = {
  reactions: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
  iconSize: 20,
  variant: 'facebook',
}

export default FacebookSelector
