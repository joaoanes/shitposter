import React from 'react'
import md5 from 'md5'
import { TwitterTweetEmbed } from 'react-twitter-embed'

const bucketUrl = 'https://s3.eu-central-1.amazonaws.com/shitposter-content'

export default class TweetRenderer extends React.PureComponent {
  props: {
    shitpost: {
      url: String,
    },
  }

  handleLoad = async (e) => {
    if (e == null || Array.from(e.shadowRoot.children).find(e => e.getAttribute("data-twitter-event-id")).clientHeight === 0) {
      return
    }

    this.props.reportSize(
      Array.from(e.shadowRoot.children).find(e => e.getAttribute("data-twitter-event-id")).clientHeight + 10
    )
  }

  componentDidMount() {

  }

  render() {
    const { fullscreen, shitpost: { url } } = this.props
    const tweetId = url.slice(url.lastIndexOf('/') + 1)

    return (
      <div style={{ width: '100%', height: "auto", minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {fullscreen ? <TwitterTweetEmbed
          tweetId={tweetId}
          onLoaded={this.handleLoad}
          options={{
            id: tweetId,
            dnt: true,
          }}
        /> :
        <img
          src={`${bucketUrl}/previews/${md5(url)}.png`}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
          alt="embebbed tweet"
        />}
      </div>
    )
  }
}
