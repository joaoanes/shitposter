import React from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import AutoSizer from "react-virtualized-auto-sizer"

export default class TweetRenderer extends React.PureComponent {
  props: {
    shitpost: {
      url: String,
    },
  }

  handleLoad = async (e) => {
    if (e == null || Array.from(e.shadowRoot.children).find(e => e.getAttribute("data-twitter-event-id")).clientHeight === 0) {
      await window.twttr.widgets.load()
      return
    }

    this.props.reportSize(
      Array.from(e.shadowRoot.children).find(e => e.getAttribute("data-twitter-event-id")).clientHeight + 10
    )
  }

  render() {
    const { url } = this.props.shitpost
    const tweetId = url.slice(url.lastIndexOf('/') + 1)
    return (
      <div style={{ width: '100%', height: "auto", minHeight: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TwitterTweetEmbed
          tweetId={tweetId}
          onLoaded={this.handleLoad}
          options={{
            id: tweetId,
            dnt: true,
          }}
        />
      </div>
    )
  }
}
