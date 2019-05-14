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


import { useEffect, useRef } from 'react'

import _ from 'lodash'
import { Place } from '@material-ui/icons';


function difference(object, base) {
	function changes(object, base) {
		return _.transform(object, function(result, value, key) {
			if (!_.isEqual(value, base[key])) {
				result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
}

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
  debugger
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
      <div style={style} >
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

  isFullscreen(id) {
    return this.props.fullscreen[0].indexOf(id) !== -1
  }

  ref = React.createRef()

  setFullscreen = async (args) => {
    this.props.setFullscreen(args)
    const index = Object.values(this.state.shitposts).findIndex(({id}) => id === args[0])
    await this.ref.current.resetAfterIndex(index - 1)
    this.ref.current.scrollToItem(index, "start")
  }

  render() {

    console.log("list rerender!", this.props.fullscreen)

    const {
      data: { shitposts: { pageInfo: { nextPage } } },
    } = this.props

    const { shitposts, itemCount } = this.state



    const isItemLoaded = (index) => {
      return shitposts[index] ? true : false
    }

    const itemSize = (index) => {
      const f = this.isFullscreen(shitposts[index].id) ? this.props.fullscreen[1] + 128 : 400
      console.log("itemsize!", index, f)
      return f
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
                  ref={this.ref}
                  height={height}
                  itemCount={itemCount}
                  itemData={[shitposts, this.props.fullscreen, this.setFullscreen]}
                  itemSize={itemSize}
                  initialScrollOffset={200}
                  overscanCount={5}
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
  query getAfterShitposts($after: String) {
    shitposts(first: 50, after: $after)
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
    withState('fullscreen', 'setFullscreen', [[], 300]),
  branch(
    ({ data: { networkStatus } }) => networkStatus < 3, // ? console.log(`starting at ${(new Date()).getTime()}`) || true : console.log(`ending at ${(new Date()).getTime()}`) && false,
    renderComponent(() => <div style={{ margin: 40, display: 'flex', justifyContent: 'center' }}><CircularProgress /></div>)
  ),
)(ShitpostList)
