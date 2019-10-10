import React, { useState, Fragment } from 'react'
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { parse } from 'qs'
import { getClientWithAuth } from '../apollo/client'

const CURRENT_USER = gql`
  {
    currentUser {
      id
      name
      is_curator
    }
  }
`;

const withLogin = (Component, handleLogin) => (
  (props) => {
    const { location } = props
    const { magic_token_ahah_its_just_a_jwt } = parse(location.search, {ignoreQueryPrefix: true})
    if (magic_token_ahah_its_just_a_jwt === undefined) {
      return <Component {...props}/>
    }

    const { error, data } = useQuery(CURRENT_USER, {client: getClientWithAuth(magic_token_ahah_its_just_a_jwt)});

    if (error) {
      console.error(error.toString())
      return <Component {...props} />
    }

    if (data && data.currentUser) {
      handleLogin(magic_token_ahah_its_just_a_jwt, data.currentUser)
      return <Component {...props} />
    }
    return <Fragment />
  }
)

export default withLogin
