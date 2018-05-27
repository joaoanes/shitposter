import React from 'react'

export default class ImageRenderer extends React.Component {
    props: {
      shitpost: {
        url: String,
      },
      fullscreen: boolean,
    }

    render () {
      const { url } = this.props.shitpost
      const { fullscreen } = this.props
      return (
        <video
          controls
          src={url}
          style={{ ...styles.video, ...(fullscreen ? styles.videoFullScreen : styles.videoNoFullscreen) }}
        />
      )
    }
}

const styles = {
  video: {
    width: '100%', height: '100%',
  },
  videoFullscreen: {
    height: 'auto',
  },
  videoNoFullscreen: {
    maxWidth: 600,
  },
}
