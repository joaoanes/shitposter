import React from 'react'

export default class ImageRenderer extends React.PureComponent {
    props: {
      shitpost: {
        url: String,
      },
      fullscreen: boolean,
      reportSize: (id : String) => void,
    }

    handleLoad({target: img}) {
      this.props.reportSize(
        (img.naturalHeight * 900 / img.naturalWidth)
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
    width: "100%",
    display: 'flex'
  },
  imageFullscreen: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundColor: 'black',
  },
  imageNormal: {
    backgroundRepeat: 'no-repeat',
    objectFit: 'cover',
    minHeight: 300,
  },
}
