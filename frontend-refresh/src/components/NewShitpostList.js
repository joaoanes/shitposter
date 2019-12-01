import React, { useState } from 'react'
import AutoSizer from "react-virtualized-auto-sizer"
import { VariableSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { max } from 'lodash'


const mustLoad = (shitposts, nextPage) => async (start, finish) => {
  console.log(start, finish)
  if (finish > Object.keys(shitposts).length)
    return await nextPage()

  return () => { }
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
    WrapperComponent: Component,
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

    // TODO: maybe optimize this? it really doesn't matter all things considered
    await this.ref.current.resetAfterIndex(0)

    scroll && this.ref.current.scrollToItem(
      index,
      "smart"
    )
  }

  render() {
    console.log("list rerender!", this.props.fullscreen)

    const {
      data: { shitposts: { pageInfo: { nextPage } } },
      WrapperComponent,
    } = this.props

    const { shitposts, itemCount } = this.state

    const isItemLoaded = (index) => (
      index < shitposts.length ? true : false
    )

    const itemSize = (index) => {
      let extra = 2
      if (index === 0) {
        extra = 200
      }
      const res = this.isFullscreen(shitposts[index])
      ? max([this.props.fullscreen[1] + 120, 300]) + extra
      : 340 + extra
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
                  height={height}
                  aref={this.ref}
                  itemCount={itemCount}
                  itemData={[shitposts, this.props.fullscreen, this.setFullscreen, this.ref, width, height]}
                  itemSize={itemSize}

                  width={width}
                  style={styles.list}
                  WrapperComponent={WrapperComponent}
                />


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
  list: { willChange: "transform z-index" },
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
  WrapperComponent,
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
      overscanCount={3}
      ref={aref}
      itemCount={itemCount}
      itemData={itemData}
      style={styles.list}
      {...directionProps[direction] || {}}
    >
      { WrapperComponent }
    </VariableSizeList>
  )
}

export default ShitpostList
