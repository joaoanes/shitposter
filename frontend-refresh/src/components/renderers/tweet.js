import React from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import AutoSizer from "react-virtualized-auto-sizer"

export default class TweetRenderer extends React.Component {
  props: {
    shitpost: {
      url: String,
    },
  }


  handleLoad = (e) => {
    this.props.reportSize(
      e.shadowRoot.children[1].clientHeight
    )
  }

  render() {
    const { url } = this.props.shitpost
    const tweetId = url.slice(url.lastIndexOf('/') + 1)

    return (
      <div style={{ width: '100%', height: "auto", minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TwitterTweetEmbed
          tweetId={tweetId}
          ref={this.tweetRef}
          onLoaded={this.handleLoad}
          options={{
            align: 'center',
          }}
        />
      </div>
    )
  }
}
