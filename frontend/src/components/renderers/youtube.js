import React from 'react'
import URL from 'url-parse'

export default class YoutubeRenderer extends React.Component {
  render() {
    const {url} = this.props.shitpost
    const ytId = new URL(url).query.slice(3)

    return (
    <div style={{width: "100%", height: "-webkit-fill-available"}}>
      <iframe
        title="ytplayer"
        src={`https://www.youtube.com/embed/${ytId}`}
        frameBorder="0"
        style={{width: "100%", height: "-webkit-fill-available"}}
      />
    </div>
    )
  }
}
