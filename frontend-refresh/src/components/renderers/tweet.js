import React from 'react'
import { Tweet } from 'react-twitter-widgets'
import { SizeMe } from 'react-sizeme'

export default class TweetRenderer extends React.Component {
  props: {
    shitpost: {
      url: String,
    },
  }


  handleLoad = () => {

    this.props.reportSize(
      800
    )
  }

  tweetRef = React.createRef()


  render () {
    const { url } = this.props.shitpost
    const tweetId = url.slice(url.lastIndexOf('/') + 1)

    return (
      <div style={{ width: '100%', height: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          <Tweet
            tweetId={tweetId}
            ref={this.tweetRef}
            onLoad={this.handleLoad}
            options={{
              align: 'center',
              height: 800,
            }}
          />
          </div>

    )
  }
}
