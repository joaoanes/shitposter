import React, { Component, Fragment } from 'react'
import { Tooltip } from 'material-ui'
import ShitpostEmojiList from '../containers/ShitpostEmojiList'

export default class RatingButton extends Component {
  props: {
    ratePost: () => void,
    shitpost: Object,
    // fullscreen: boolean,
    rated: boolean,
    isRating: boolean,
  }

  render = () => {
    const { shitpost, rated, isRating, ratePost } = this.props

    return (
      <Fragment>
        <Tooltip title='Like shitpost!'>
          <ShitpostEmojiList
            rated={rated}
            isRating={isRating}
            reactions={shitpost.fakeReactions}
            onSelect={ratePost}
          />
        </Tooltip>
      </Fragment>
    )
  }
}
