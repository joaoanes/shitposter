import React from 'react'
import { compose, branch, renderComponent, withState, withProps } from 'recompose'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import CircularProgress from '@material-ui/core/CircularProgress'
import { paginated } from '../apollo/client'
import NewShitpostCard from '../components/NewShitpostCard'
import PlaceholderCard from '../components/PlaceholderCard'

import AutoSizer from "react-virtualized-auto-sizer"

import ShitpostCardMutation from '../hocs/ShitpostCardMutation'
import EnhancedShitpostCard from './EnhancedShitpostCard'

import { VariableSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import _, { pickBy } from 'lodash'

const EndMessage = () => <>' '<p style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', marginBottom: 40, marginTop: 40 }}>
  <b>Yay! You have seen it all!
    <span
      role='img'
      aria-label='lovely'
    >
      💖
    </span>
  </b>
  <b>Now go submit some more shit(post)!</b>
</p>''</>

const mustLoad = (shitposts, nextPage) => async (start, finish) => {
  console.log(start, finish)
  if (finish > Object.keys(shitposts).length)
    return await nextPage()

  return () => { }
}

class CardWrapper extends React.PureComponent {
    render = () => {
    const { index, style, data: [shitposts, fullscreen, setFullscreen] } = this.props
    const CardComponent = (index >= shitposts.length) ? PlaceholderCard : EnhancedShitpostCard

    const shitpost = shitposts[index]
    return (
      <div style={{...style, marginTop: index === 0 ? 200 : 0}} >
        <CardComponent
          shitpost={shitpost}
          fullscreen={fullscreen.indexOf(shitpost.id) !== -1}
          setFullscreen={setFullscreen}
        />
      </div>
    )
  }
}

class ShitpostList extends React.Component {
  props: {
    addQuery: (url: String, name: String) => void,
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

  state = {
    shitposts: [],
    fullscreen: [],
  }

  static getDerivedStateFromProps(props, state) {
    const shitposts = props.data.shitposts.edges.map(e => e.node)
    const {
      data: { shitposts: { pageInfo: { hasNextPage } } },
    } = props

    const itemCount = hasNextPage ? shitposts.length + 10 : shitposts.length


    return ({...state, shitposts: {...shitposts}, itemCount})
  }

  addQuery = (url, name) => {
    this.props.addQuery(url, name)
  }

  isFullscreen(shitpost) {
    const id = shitpost ? shitpost.id : null
    return this.props.fullscreen[0] ? this.props.fullscreen[0].indexOf(id) !== -1 : false
  }

  ref = React.createRef()

  setFullscreen = async (args) => {
    const alreadyFullscreen = this.isFullscreen(args[0])
    if (alreadyFullscreen) {
      this.props.setFullscreen([null, 300])
    } else {
      this.props.setFullscreen(args)
    }

    const index = Object.values(this.state.shitposts)
      .findIndex(({id}) => id === args[0])
    const updateFromIndex = index === 0 ? 0 : index - 1

    await this.ref.current.resetAfterIndex(updateFromIndex)
    console.log(this.ref.current)
    this.ref.current.scrollToItem(
      index,
      alreadyFullscreen ? "auto" : "smart"
    )
  }

  render() {
    console.log("list rerender!", this.props.fullscreen)

    const {
      data: { shitposts: { pageInfo: { nextPage } } },
    } = this.props

    const { shitposts, itemCount } = this.state

    const isItemLoaded = (index) => (
      index < shitposts.length ? true : false
    )

    const itemSize = (index) => {
      let extra = 0
      if (index === 0) {
        extra = 200
      }
      return this.isFullscreen(shitposts[index])
      ? this.props.fullscreen[1] + 50 + extra
      : 500 + extra
    }

    return (
      <div style={styles.container}>
        <AutoSizer>
          {({ width, height }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={mustLoad(shitposts, nextPage)}
            >
              {({ onItemsRendered }) => (
                <VariableSizeList
                  onItemsRendered={onItemsRendered}
                  overscanCount={3}
                  height={height}
                  ref={this.ref}
                  itemCount={itemCount}
                  itemData={[shitposts, this.props.fullscreen, this.setFullscreen]}
                  itemSize={itemSize}
                  width={width}
                  style={styles.list}
                >
                  { CardWrapper }
                </VariableSizeList>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
    )
  }
}

const styles = {
  container: { width: "100vw", height: "100vh" },
  list: { willChange: "transform z-index" }
}

export default compose(
  graphql(gql`
  query getAfterShitposts($after: String, $types: [ShitpostType]) {
    shitposts(first: 50, after: $after, types: $types)
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
      options: (props) => ({
        variables: { types: Object.keys(pickBy(props.filters, value => value)).map(s => s.toUpperCase())},
        fetchPolicy: 'cache-and-network',
      }),
    }),
    withState('fullscreen', 'setFullscreen', [null, 300]),
  branch(
    ({ data: { networkStatus } }) => networkStatus < 3, // ? console.log(`starting at ${(new Date()).getTime()}`) || true : console.log(`ending at ${(new Date()).getTime()}`) && false,
    renderComponent(() => <div style={{ margin: 40, display: 'flex', justifyContent: 'center' }}><CircularProgress /></div>)
  ),
)(ShitpostList)
