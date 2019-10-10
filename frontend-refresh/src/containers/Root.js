import React, { Component, useState, useEffect } from 'react'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { ToastContainer } from 'react-toastify'
import AutoSizer from "react-virtualized-auto-sizer"
import { withProps } from "recompose"

import Header from './Header'
import ShitpostList from './ShitpostList'
import ShitpostGQL from './ShitpostGQL'
import apolloClient, { getClientWithAuth } from '../apollo/client'
import withLogin from '../hocs/withLogin'


const Root = () => {
  const [filters, setFilters] = useState(initialFilters)
  const [tentativeToken, tentativeUser] = JSON.parse(localStorage.getItem("user") || "[]")

  const [client, setClient] = useState(tentativeToken ? getClientWithAuth(tentativeToken): apolloClient)
  const [currentUser, setCurrentUser] = useState(tentativeUser)

  const ListWithFiltersComponent = withProps((props) => ({
    ...props,
    filters: filters,
    currentUser: currentUser,
  }))(ShitpostList)

  const handleLogin = (token, currentUser) => {
    setCurrentUser(currentUser)
    setClient(getClientWithAuth(token))
    localStorage.setItem("user", JSON.stringify([token, currentUser]))
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setCurrentUser(null)
    setClient(apolloClient)
  }

  return (
    <AutoSizer>
      {
        ({ width, height }) => (
          <div style={{ ...styles.appContainer, width, height }}  >
            <div style={styles.headerContainer}>
              <Header filters={filters} setFilters={setFilters} currentUser={currentUser} handleLogout={handleLogout}/>
            </div>

            <ApolloProvider client={client}>
              <BrowserRouter>
                <div style={{ display: "flex" }}>
                  <Route
                    exact
                    path='/'
                    component={ListWithFiltersComponent}
                  />
                  <Route
                    exact
                    path='/login'
                    component={withLogin(withProps({to: "/"})(Redirect), handleLogin)}
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

export default Root
