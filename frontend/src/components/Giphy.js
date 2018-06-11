
import React, { Component } from 'react'

export default class SuperGiphy extends Component {
  props: {
    keyword: String,
    apiKey: String,
    style: Object,
  }

  state = {
    imageSrc: '',
  }

  static defaultProps = {
    apiKey: 'VvILX7Y9L9oD7ZOH7yGXy05V7VD2xzIm',
    keyword: 'kitten',
    style: {},
  }

  componentDidMount () {
    fetch(`https://api.giphy.com/v1/gifs/random?api_key=${this.props.apiKey}&tag=${this.props.keyword}&rating=${'Y'}`)
      .then((res) => res.json())
      .then((res) => {
        this.setState({ imageSrc: res.data.image_url })
      })
  }

  render () {
    return (
      <div style={{ ...this.props.style, display: 'flex', textAlign: 'center', width: '100%', height: '100%' }}>
        <div
          style={{
            ...styles.image,
            backgroundImage: `url(${this.state.imageSrc})`,
          }}
        />
      </div>
    )
  }
}

const styles = {
  image: {
    flexGrow: 1,
    backgroundSize: 'contain',
    backgroundPosition: 'center bottom',
  },
}
