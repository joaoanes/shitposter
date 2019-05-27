import React, { Component, Fragment } from 'react'
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
        <ShitpostEmojiList
          rated={rated}
          isRating={isRating}
          reactions={shitpost.fakeReactions}
          onSelect={ratePost}
        />
      </Fragment>
    )
  }
}
