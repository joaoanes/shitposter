import React from 'react'

export default class ImageRenderer extends React.PureComponent {
    props: {
      shitpost: {
        url: String,
      },
      fullscreen: boolean,
      reportSize: (id : String) => void,
      width: Number,
    }

    handleLoad({target: img}) {

      this.props.reportSize(
        [img.naturalWidth, img.naturalHeight]
      )
    }

    render () {
      const { url } = this.props.shitpost
      const { fullscreen } = this.props
      return (
        <img
          src={url}
          onLoad={this.handleLoad.bind(this)}
          style={{ ...styles.image, ...(fullscreen ? styles.imageFullscreen : styles.imageNormal) }}
        />
      )
    }
}

const styles = {
  image: {

    display: 'flex'
  },
  imageFullscreen: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundColor: 'black',
    width: "100%",
  },
  imageNormal: {
    width: "100%",
    backgroundRepeat: 'no-repeat',
    objectFit: 'cover',
    minHeight: 300,
  },
}
