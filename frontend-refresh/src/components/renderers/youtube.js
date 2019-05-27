import React from 'react'
import ReactPlayer from 'react-player'

export default class YoutubeRenderer extends React.PureComponent {
  props: {
    shitpost: {
      url: String,
    },
    fullscreen: boolean,
    reportSize: (id: String) => void,
  }
  handleReady = (e) => {
    this.props.reportSize(e.wrapper.clientHeight)
  }

  render() {
    const { shitpost } = this.props
    const { url } = shitpost

    return (
      <ReactPlayer url={url}
        width='100%'
        controls
        onReady={this.handleReady}
      />
    )
  }
}
