
import React, { Component } from 'react'
import { compose, branch, renderComponent } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { find, get } from 'lodash'
import CircularProgress from '@material-ui/core/CircularProgress'
import FacebookSelector from '../components/StolenFacebookSelector'

class ShitpostEmojiList extends Component {
  props: {
    data: {
      ratings: Object,
    },
    reactions: Object,
    onSelect: (id:Number, ratingId:Number) => void,
  }

  render () {
    const {
      data: { ratings },
      reactions,
      onSelect,
      rated,
      isRating,
    } = this.props

    const reactionsWithAllRatings = ratings.map(({ emoji, id }) => {
      const foundReactions = find(reactions,
        ({ emoji: reactionEmoji }) => reactionEmoji === emoji
      )
      const count = get(foundReactions, 'count', 0)
      return {
        emoji,
        id,
        count: isRating && count !== 0 ? "?" : count,
      }
    })

    return (
      <div style={styles.container}>
        <FacebookSelector
          showLabels={rated}
          onlyShowFirst={!rated}
          reactions={reactionsWithAllRatings}
          onSelect={onSelect}
        />
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}

export default compose(
  graphql(gql`
  query getRatings {
    ratings {
      emoji
      id
    }
  }
  `),
  branch(
    ({ data: { networkStatus } }) => networkStatus < 3, // ? console.log(`starting at ${(new Date()).getTime()}`) || true : console.log(`ending at ${(new Date()).getTime()}`) && false,
    renderComponent(() => <div style={{ margin: 40, display: 'flex', justifyContent: 'center' }}><CircularProgress /></div>)
  ),

)(ShitpostEmojiList)
