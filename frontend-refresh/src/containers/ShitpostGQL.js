import React, { Component } from 'react'
import { compose, branch, renderComponent } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import CircularProgress from '@material-ui/core/CircularProgress'
import EnhancedShitpostCard from './EnhancedShitpostCard'

class ShitpostGQL extends Component {
  props: {
    data: {
      shitpost: Object,
    },
  }

  render () {
    const {
      data: { shitpost },
    } = this.props

    return (
      <div style={styles.container}>
        <EnhancedShitpostCard
          key={shitpost.id}
          shitpost={shitpost}
        />
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}

export default compose(
  graphql(gql`
  query getShitpost($id: Int!) {
    shitpost(id: $id)
    {
      id
      permalink
      url
      type
      name
      fakeReactions {
        emoji
        count
      }
      source {
        name
      }
    }
  }
  `, {
    options: ({ match: { params: { id } } }) => ({

      variables: { id },
    }),
  }),
  branch(
    ({ data: { networkStatus } }) => networkStatus < 3, // ? console.log(`starting at ${(new Date()).getTime()}`) || true : console.log(`ending at ${(new Date()).getTime()}`) && false,
    renderComponent(() => <div style={{ margin: 40, display: 'flex', justifyContent: 'center' }}><CircularProgress /></div>)
  ),
)(ShitpostGQL)
