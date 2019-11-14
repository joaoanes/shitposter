import React, { useState } from 'react'
import { compose, branch, renderComponent, withState, withProps, pure } from 'recompose'
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

import { pickBy, max, min } from 'lodash'
import NewCard from '../components/NewCard'
import ShitpostList from '../components/NewShitpostList'

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

const ItemWrapper = ({ shitpost, style, setFullscreen, fullscreen, width, maxHeight, ...rest }) => {

  let TypeRenderer
  const [[reportedWidth, reportedHeight], setKnownDimensions] = useState([0,0])

  let wantedDimensions = [reportedWidth, reportedHeight]
  if (reportedWidth !== 0) {
    if (reportedWidth > width) {
      wantedDimensions = [width, width * reportedHeight / reportedWidth]
    }
    if (reportedHeight > maxHeight) {
      wantedDimensions = [maxHeight * reportedWidth / reportedHeight, maxHeight]
    }
  }

  const [wantedWidth, wantedHeight] = wantedDimensions

  console.log("report", reportedWidth, reportedHeight, wantedDimensions)
  try {
    TypeRenderer = require('../components/renderers/' + shitpost.type.toLowerCase()).default
  } catch (e) {
    TypeRenderer = require('../components/renderers/default.js').default
  }


  return (
    <div style={style}>
      <div style={styles.wrapper}>
        <NewCard
          {...rest}
          fullscreen={fullscreen}
          maxHeight={maxHeight}
          initialLongSizeLength={width}
          setItemFullscreen={() => (() => {debugger ;return false})() || setFullscreen([shitpost.id, wantedDimensions[1]])}
        >
        <div style={fullscreen ? {width: wantedWidth, height: wantedHeight} : {width: "100%"}}>
          <TypeRenderer
            fullscreen={fullscreen}
            shitpost={shitpost}
            width={width}
            maxHeight={maxHeight}
            wantedDimensions={wantedDimensions}
            reportSize={setKnownDimensions}
          />
          </div>
        </NewCard>
      </div>
    </div>
  )
};

class CardWrapper extends React.PureComponent {
    render = () => {
    const { index, style, data: [shitposts, fullscreen, setFullscreen, ref, width, maxHeight] } = this.props
    const CardComponent = (index >= shitposts.length) ? PlaceholderCard : ItemWrapper
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
          width={width}
          maxHeight={maxHeight}
        />}
      </div>
    )
  }
}

const styles = {
  container: { width: "100vw", height: "100vh" },
  list: { willChange: "transform z-index" },
  wrapper: {
    display: "flex",
    backgroundColor: 'rgba(255,0,0,0.2)',
    justifyContent: 'center',
  }
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
  withProps({WrapperComponent: CardWrapper})
)(ShitpostList)
