import React, { Component } from 'react';
import axios from 'axios'
import logo from './logo.svg';
import './App.css';

const BACKEND_URL = "https://puppeteer.shitpost.network"

class App extends Component {
  state = {
    ignoreInit: false,
    ignoreFetch: false,
    ignoreSubmit: false,
  }

  refresh = async () => {
    const request = await axios.get(`${BACKEND_URL}/stats`)
    const {events, lastKnownId, posts} = request.data
    this.setState({events, lastKnownId, posts})
  }

  componentDidMount = async () => {
    return this.refresh()
  }

  submitEvent = async () => {
    const { ignoreFetch, ignoreInit, ignoreSubmit } = this.state
    const params = {}
    if (ignoreFetch) { params["ignoreFetch"] = true }
    if (ignoreInit) { params["ignoreInit"] = true }
    if (ignoreSubmit) { params["ignoreSubmit"] = true }
    const res = await axios.get(`${BACKEND_URL}/execute`, { params })
    const self = this
    await this.refresh().then(() => {self.setState({lastEvent: res.data})})
  }

  showPosts = (posts) => (<div>it's {posts} of em</div>)

  changeChangebox = (id) => {
    this.setState({...this.state, [id]: !this.state[id]})
  }

  render() {
    if (Object.keys(this.state).length === 3) {
      return (<div>pls w8</div>)
    }
    console.log(this.state)
    const { events, lastKnownId, posts, ignoreFetch, ignoreInit, ignoreSubmit, lastEvent } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <span>Last seen ID</span>
          <span>{lastKnownId}</span>
          <span>{JSON.stringify(posts)}</span>
          <button onClick={this.submitEvent.bind(this)}>DO IT</button>
          <div>
            <span>ignoreInit</span>
            <input type="checkbox" id="ignoreInit" value={ignoreInit} onChange={(e) => {this.changeChangebox.bind(this)(e.target.id)}} />
          </div>

          <div>
          <span>ignoreFetch</span>
            <input type="checkbox" id="ignoreFetch" value={ignoreFetch} onChange={(e) => {this.changeChangebox.bind(this)(e.target.id)}} />
          </div>
          <div>
            <span>ignoreSubmit</span>
            <input type="checkbox" id="ignoreSubmit" value={ignoreSubmit} onChange={(e) => {this.changeChangebox.bind(this)(e.target.id)}} />
          </div>
          {
            lastEvent ? (<div>
              last event: {lastEvent}
            </div>) : null
          }
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
