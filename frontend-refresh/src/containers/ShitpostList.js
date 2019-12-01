import React, { useState } from 'react'
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

import { pickBy, max } from 'lodash'
import NewCard from '../components/NewCard'

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
    const { index, style, data: [shitposts, fullscreen, setFullscreen, ref] } = this.props
    const CardComponent = (index >= shitposts.length) ? PlaceholderCard : EnhancedShitpostCard
    const reset = () => {
      console.log("resetting")
      if (ref) {
        ref.current.resetAfterIndex(0, false)
      }
    }
    const shitpost = shitposts[index]
    return (
      <div style={{...style, marginTop: index === 0 ? 200 : 0}} >
        {shitpost && <CardComponent
          shitpost={shitpost}
          fullscreen={fullscreen.indexOf(shitpost.id) !== -1}
          setFullscreen={setFullscreen}
          reset={reset}
        />}
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
    console.log("is", id, "full", this.props.fullscreen[0])
    return this.props.fullscreen[0] === id
  }

  ref = React.createRef()

  setFullscreen = async (args, scroll = true) => {

    this.props.setFullscreen(args)

    const index = Object.values(this.state.shitposts)
      .findIndex(({id}) => id === args[0])
    const updateFromIndex = index === 0 ? 0 : index - 1

    await this.ref.current.resetAfterIndex(updateFromIndex)

    scroll && this.ref.current.scrollToItem(
      index,
      "smart"
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
      const res = this.isFullscreen(shitposts[index])
      ? max([this.props.fullscreen[1] + 50, 300]) + extra
      : 300 + extra
      console.log("size", index, res, this.props.fullscreen)
      return res
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
                <ListWithDirections
                  onItemsRendered={onItemsRendered}
                  overscanCount={2}
                  height={height}
                  aref={this.ref}
                  itemCount={itemCount}
                  itemData={[shitposts, this.props.fullscreen, this.setFullscreen, this.ref]}
                  itemSize={itemSize}

                  width={width}
                  style={styles.list}
                >
                  { CardWrapper }
                </ListWithDirections>
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

const ListWithDirections = ({
  onItemsRendered,
  height,
  aref,
  itemCount,
  itemData,
  itemSize,
  width,
  style,
  shitposts,
  children,
}) => {
  const [direction, setDirection] = useState("scroll")
  const directionProps = {
    list: {
      height: height,
      width: width,
      itemSize: () => width,
      layout: "horizontal"
    },
    scroll: {
      height: height,
      width: width,
      itemSize: itemSize,
    },
  }


  return (
    <VariableSizeList
      onItemsRendered={onItemsRendered}
      overscanCount={2}
      ref={aref}
      itemCount={itemCount}
      itemData={itemData}
      style={styles.list}
      {...directionProps[direction] || {}}
    >
      { CardWrapper }
    </VariableSizeList>
  )
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
