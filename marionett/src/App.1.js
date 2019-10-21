import React, { Component } from 'react';
import axios from 'axios'
import logo from './logo.svg';
import './App.css';

const BACKEND_URL = "http://18.197.168.231:4001/stats"

class App extends Component {
  state = {

  }

  componentDidMount = async () => {
    const request = await axios.get(BACKEND_URL)
    const {events, lastKnownId, posts} = request.data
    this.setState({events, lastKnownId, posts})
  }

  showPosts = (posts) => (<div>it's {posts ? posts.length : "nulle"} of em</div>)

  render() {
    if (Object.keys(this.state).length === 0) {
      return (<div>pls w8</div>)
    }
    const { events, lastKnownId, posts } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <span>Last seen ID</span>
          <span>{lastKnownId}</span>
          <span>{JSON.stringify(posts)}</span>
        </header>
        {
          events.map(({id, postsInited, postsFetched, postsSubmitted, createdAt, updatedAt}) => (
            <div key={id}>
              <div>{id}</div>
              <div>load: {this.showPosts(postsInited)}</div>
              <div>fetch: {this.showPosts(postsFetched)}</div>
              <div>submit: {this.showPosts(postsSubmitted)}</div>
              <div>{createdAt}</div>
              <div>{updatedAt}</div>
            </div>
          ))
        }
      </div>
    );
  }
}

export default App;
