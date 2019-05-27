import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { ToastContainer } from 'react-toastify'
import AutoSizer from "react-virtualized-auto-sizer"
import { withState, compose, withProps } from "recompose"

import Header from './Header'
import ShitpostList from './ShitpostList'
import ShitpostGQL from './ShitpostGQL'
import apolloClient from '../apollo/client'

class Root extends Component {
  render() {
    const ListWithFiltersComponent = withProps((props) => ({
      ...props,
      filters: this.props.filters,
    }))(ShitpostList)

    const { filters, setFilters } = this.props
    return (
      <AutoSizer>
        {
          ({ width, height }) => (
            <div style={{ ...styles.appContainer, width, height }}  >
              <div style={styles.headerContainer}>
                <Header filters={filters} setFilters={setFilters}/>
              </div>

              <ApolloProvider client={apolloClient}>
                <BrowserRouter>
                  <div style={{ display: "flex" }}>
                    <Route
                      exact
                      path='/'
                      component={ListWithFiltersComponent}
                    />
                    <Route
                      path='/:id'
                      component={ShitpostGQL}
                    />
                  </div>
                </BrowserRouter>
              </ApolloProvider>

              <ToastContainer autoClose={false} />
            </div>
          )
        }
      </AutoSizer>
    )
  }
}

const styles = {
  headerContainer: {
    position: "absolute",
    width: "100%",
    height: 200,
    top: 0,
  },
  appContainer: {
    background: "-webkit-linear-gradient(to top, #414345, #232526)",
    background: "linear-gradient(to top, #414345, #232526)",
  }
}

const initialFilters = {
  "image": true,
  "animated_image": true,
  "mute_video": true,
  "video": true,
  "youtube": true,
  "tweet": true,
  "facebook_post": true,
  "amp": true,
  "medium_post": true,
  "webpage": true,
}

export default compose(
  withState("filters", "setFilters", initialFilters),
)(Root)
