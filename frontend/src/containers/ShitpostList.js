import React, { Component } from 'react'
import { compose, branch, renderComponent } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { CircularProgress } from 'material-ui/Progress'
import { paginated } from '../apollo/client'
import NewShitpostCard from '../components/NewShitpostCard'
import InfiniteScroll from 'react-infinite-scroll-component'
import ShitpostCardMutation from '../hocs/ShitpostCardMutation'
import EnhancedShitpostCard from './EnhancedShitpostCard'

class ShitpostList extends Component {
  props: {
    addQuery: (url : String, name : String) => void,
    data: {
      loading: boolean,
      shitposts: {
        edges: Object[],
        pageInfo: {
          hasNextPage: boolean,
          nextPage: () => void,
        },
      },
    },
  }
  addQuery = (url, name) => {
    this.props.addQuery(url, name)
  }
  render () {
    const {
      data: { shitposts: { pageInfo: { hasNextPage, nextPage } }, loading },
    } = this.props

    const shitposts = this.props.data.shitposts.edges.map(e => e.node)

    return (
      <InfiniteScroll
        scrollThreshold={0.5}
        throttle={32}
        next={nextPage}
        hasMore={hasNextPage}
        endMessage={(
          <p style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', marginBottom: 40, marginTop: 40 }}>
            <b>Yay! You have seen it all!
              <span
                role='img'
                aria-label='lovely'
              >
                💖
              </span>
            </b>
            <b>Now go submit some more shit(post)!</b>
          </p>
        )}
      >
        <div style={styles.container}>
          <NewShitpostCard />
          {
            shitposts.map((shitpost) => (
              <EnhancedShitpostCard
                key={shitpost.id}
                shitpost={shitpost}
              />
            ))
          }
          {
            loading && <div style={{ margin: 40 }}><CircularProgress /></div>
          }

        </div>
      </InfiniteScroll>
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
  query getAfterShitposts($after: String) {
    shitposts(first: 20, after: $after)
    {
      pageInfo{
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
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
    }
  }
  `, {
    props: paginated('shitposts'),
    options: {
      fetchPolicy: 'cache-and-network',
    },
  }),
  branch(
    ({ data: { networkStatus } }) => networkStatus < 3, // ? console.log(`starting at ${(new Date()).getTime()}`) || true : console.log(`ending at ${(new Date()).getTime()}`) && false,
    renderComponent(() => <div style={{ margin: 40, display: 'flex', justifyContent: 'center' }}><CircularProgress /></div>)
  ),
)(ShitpostList)
