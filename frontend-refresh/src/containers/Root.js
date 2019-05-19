import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'

import ShitpostList from './ShitpostList'
import ShitpostGQL from './ShitpostGQL'
import apolloClient from '../apollo/client'

export default class Root extends Component {
  render () {
    return (
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <div style={{display: "flex"}}>
            <Route
              exact
              path='/'
              component={ShitpostList}
            />
            <Route
              path='/:id'
              component={ShitpostGQL}
            />
          </div>
        </BrowserRouter>
      </ApolloProvider>
    )
  }
}
