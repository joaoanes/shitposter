import React from 'react'

export default class ImageRenderer extends React.Component {
    props: {
      shitpost: {
        url: String,
      },
      fullscreen: boolean,
    }

    handleLoad({target: video}) {
      debugger
      this.props.reportSize(
        video.videoHeight * 800 / video.videoWidth
      )
    }

    render () {
      const { url } = this.props.shitpost
      const { fullscreen } = this.props
      return (
        <video
          controls
          src={url}
          onCanPlay={this.handleLoad.bind(this)}
          style={{ ...styles.video, ...(fullscreen ? styles.videoFullScreen : styles.videoNoFullscreen) }}
        />
      )
    }
}

const styles = {
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
  },
  videoFullscreen: {
    height: 'auto',
  },
  videoNoFullscreen: {
    height: 300,
    maxWidth: 600,
  },
}
