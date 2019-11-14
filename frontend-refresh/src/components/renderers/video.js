import React from 'react'

export default class ImageRenderer extends React.PureComponent {
    props: {
      shitpost: {
        url: String,
      },
      fullscreen: boolean,
      width: Number,
    }

    handleLoad({target: video}) {
      const { width } = this.props
      const { videoHeight, videoWidth } = video

      this.props.reportSize(
        [videoWidth, videoHeight]
      )
    }

    render () {
      const { url } = this.props.shitpost
      const { fullscreen, wantedDimensions } = this.props
      const [width, height] = wantedDimensions

      const styleProps = {
        ...styles.video,
        ...(fullscreen ? styles.videoFullScreen : styles.videoNoFullscreen),
        ...(wantedDimensions !== [0, 0] && fullscreen ? {width, height} : {})
      }

      return (
        <video
          controls

          preload="metadata"
          src={url}
          onCanPlay={this.handleLoad.bind(this)}
          style={styleProps}
        />
      )
    }
}

const styles = {
  video: {
    objectFit: 'cover',
    objectPosition: 'center'
  },
  videoFullscreen: {
    height: 'auto',
    maxHeight: "100vh",
    maxWidth: "100%",
  },
  videoNoFullscreen: {
    width: "100%",
  },
}
