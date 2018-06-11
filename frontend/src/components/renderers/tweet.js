import React from 'react'
import { Tweet } from 'react-twitter-widgets'

export default class YoutubeRenderer extends React.Component {
  props: {
    shitpost: {
      url: String,
    },
  }
  render () {
    const { url } = this.props.shitpost
    const tweetId = url.slice(url.lastIndexOf('/') + 1)

    return (
      <div style={{ width: '100%', height: '-webkit-fill-available', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Tweet
          tweetId={tweetId}
          options={{
            align: 'center',
          }}
          style={{
            marginTop: 100,
          }}
        />
      </div>
    )
  }
}
