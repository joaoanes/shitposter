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
        <img
          src={url}
          style={{ ...styles.image, ...(fullscreen ? styles.imageFullscreen : styles.imageNormal) }}
        />
      )
    }
}

const styles = {
  image: {
    width: '100%', height: 'auto',
  },
  imageFullscreen: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundColor: 'black',
  },
  imageNormal: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
}
