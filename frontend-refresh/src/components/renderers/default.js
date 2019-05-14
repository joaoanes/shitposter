import React from 'react'
import md5 from 'md5'

const bucketUrl = 'https://s3.eu-central-1.amazonaws.com/shitposter-content'

export default class DefaultRenderer extends React.Component {
    props: {
      fullscreen: boolean,
      shitpost: {
        url: String,
      },
    }

    render () {
      const { fullscreen, shitpost: { url } } = this.props
      if (fullscreen) {
        return (
          <iframe
            style={{ width: '1200px', height: '-webkit-fill-available' }}
            frameBorder={0}
            title='google'
            src={url}
          />
        )
      }
      return <div style={{ width: '100%', height: '-webkit-fill-available', backgroundImage: `url(${bucketUrl}/previews/${md5(url)}.png)`, backgroundSize: 'cover' }} />
    }
}
