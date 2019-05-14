import React from 'react'

export default class YoutubeRenderer extends React.Component {
  props: {
    shitpost: {
      url: String,
    },
    fullscreen: boolean,
  }
  render () {
    const { fullscreen, shitpost } = this.props
    const { url } = shitpost

    const [_matchedUrl, _protocol, _subdomain, _domain, _path, ytId, _query] = url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/) // eslint-disable-line no-unused-vars

    return (
      <div style={{ width: fullscreen ? '1200px' : '100%', height: '-webkit-fill-available' }}>
        <iframe
          title='ytplayer'
          src={`https://www.youtube.com/embed/${ytId}`}
          frameBorder='0'
          style={{ width: '100%', height: '-webkit-fill-available' }}
        />
      </div>
    )
  }
}
