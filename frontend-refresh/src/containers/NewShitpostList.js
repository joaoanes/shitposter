import React, { useState } from 'react'
import { compose, branch, renderComponent, withState, withProps, pure } from 'recompose'
import { graphql } from 'react-apollo'
import { memoize, isEqual } from 'lodash'
import gql from 'graphql-tag'
import CircularProgress from '@material-ui/core/CircularProgress'
import { paginated } from '../apollo/client'
import RatingButton from '../components/RatingButton'
import PlaceholderCard from '../components/PlaceholderCard'

import AutoSizer from "react-virtualized-auto-sizer"

import ShitpostCardMutation from '../hocs/ShitpostCardMutation'
import { enhance } from './EnhancedShitpostCard'

import { VariableSizeList } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import { pickBy, max, min } from 'lodash'
import NewCard, { styles as NewCardStyles } from '../components/NewCard'
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

const raterWrapperStyles = {
  raterWrapper: {
    position: "absolute",
    pointerEvents: "none",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  raterContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  raterBox: {
    bottom: 40,
    left: 0,
    position: "absolute",
    height: 30,
    pointerEvents: "all",
  }
}

const RaterWrapper =({
  ratePost: originalRatePost,
  isRating,
  shitpost,
  rated,
}) => {

  const wasRatedRecently = localStorage.getItem(`rater-${shitpost.id}`) !== null
  if (wasRatedRecently) { debugger }
  const boxStyles = {
    ...raterWrapperStyles.raterBox,
    ...(wasRatedRecently ? {right: 30} : {})
  }

  const ratePost = async (postId) => {
    originalRatePost(postId).then(() => {
      localStorage.setItem(`rater-${shitpost.id}`, true)
    })
  }

  return (
    <div style={raterWrapperStyles.raterWrapper}>
      <div style={raterWrapperStyles.raterContainer}>
        <div style={boxStyles}>
          <RatingButton
            ratePost={ratePost}
            shitpost={shitpost}
            rated={rated || wasRatedRecently}
            isRating={isRating}
          />
        </div>
      </div>
    </div>
  )
}

const calculateDimensions = (reportedWidth, paddedMaxWidth, reportedHeight, paddedMaxHeight) => {
  if (reportedWidth > paddedMaxWidth && reportedHeight > paddedMaxHeight) {
    let wantedScale
    if (reportedWidth > reportedHeight) {
      wantedScale = paddedMaxWidth/reportedWidth
    } else {
      wantedScale = paddedMaxHeight/reportedHeight
    }
    return calculateDimensions(reportedWidth * wantedScale, paddedMaxWidth, reportedHeight * wantedScale, paddedMaxHeight)
  }

  if (reportedWidth > paddedMaxWidth) {
    return [paddedMaxWidth, paddedMaxWidth * reportedHeight / reportedWidth]
  }

  if (reportedHeight > paddedMaxHeight) {
    return [paddedMaxHeight * reportedWidth / reportedHeight, paddedMaxHeight]
  }

  return [reportedWidth, reportedHeight]
}

const ItemWrapper = ({ shitpost, style, ratePost, isRating, rated, setFullscreen, fullscreen, width, maxHeight, ...rest }) => {

  let TypeRenderer
  const [[reportedWidth, reportedHeight], setKnownDimensions] = useState([0, 0])
  const paddedMaxHeight = maxHeight * 0.85

  const wantedDimensions = memoize(calculateDimensions)(reportedWidth, width, reportedHeight, paddedMaxHeight)

  const [wantedWidth, wantedHeight] = wantedDimensions

  console.log("report", reportedWidth, reportedHeight, wantedDimensions, isRating, rated)
  try {
    TypeRenderer = require('../components/renderers/' + shitpost.type.toLowerCase()).default
  } catch (e) {
    TypeRenderer = require('../components/renderers/default.js').default
  }

  const wrapperStyles = {
    ...(fullscreen ? { width: wantedWidth, height: wantedHeight } : { width: "100%" }),
    position: "relative",
  }

  const EnhancedRater = pure(
    withProps({
      ratePost,
      isRating,
      rated,
      shitpost,
    })(RaterWrapper)
  )

  return (
    <div style={style}>
      <div style={styles.wrapper}>
        <NewCard
          {...rest}
          fullscreen={fullscreen}
          maxHeight={maxHeight}
          initialLongSizeLength={width}
          OverlayComponent={EnhancedRater}
          setItemFullscreen={() => setFullscreen([shitpost.id, wantedDimensions[1]])}
        >
          <div style={wrapperStyles}>
            <TypeRenderer
              fullscreen={fullscreen}
              shitpost={shitpost}
              width={width - 40}
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

const EnhancedItemWrapper = enhance(ItemWrapper)

class CardWrapper extends React.PureComponent {

  render = () => {
    const { index, style, data: [shitposts, fullscreen, setFullscreen, ref, width, maxHeight] } = this.props
    const CardComponent = (index >= shitposts.length) ? PlaceholderCard : EnhancedItemWrapper
    const reset = () => {
      console.log("resetting")
      if (ref) {
        ref.current.resetAfterIndex(0, false)
      }
    }
    const shitpost = shitposts[index]
    return (
      <div style={{ ...style, transition: "all 0.25s" }} >
        {shitpost && <CardComponent
          shitpost={shitpost}
          fullscreen={fullscreen.indexOf(shitpost.id) !== -1}
          setFullscreen={setFullscreen}
          reset={reset}
          width={width - ((NewCardStyles.newCard.margin + 1) * 2)}
          maxHeight={maxHeight}
        />}
      </div>
    )
  }
}

const styles = {
  list: { willChange: "transform z-index" },
  wrapper: {
    display: "flex",
    backgroundColor: 'rgba(255,0,0,0.2)',
    justifyContent: 'center',
  },
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
      variables: { types: Object.keys(pickBy(props.filters, value => value)).map(s => s.toUpperCase()) },
      fetchPolicy: 'cache-and-network',
    }),
  }),
  withState('fullscreen', 'setFullscreen', [null, 300]),
  branch(
    ({ data: { networkStatus } }) => networkStatus < 3, // ? console.log(`starting at ${(new Date()).getTime()}`) || true : console.log(`ending at ${(new Date()).getTime()}`) && false,
    renderComponent(() => <div style={{ margin: 40, display: 'flex', justifyContent: 'center' }}><CircularProgress /></div>)
  ),
  withProps({ WrapperComponent: React.memo(
    CardWrapper,
    (prev, next) => {
      const amITheOne = next.data[1][0] === next.data[0][next.index].id
      const didStylesChange = isEqual(next.style, prev.style)
      const didFullscreenChange = prev.data[1][0] !== next.data[1][0]
      const didIupdate = isEqual(next.data[0][next.index], prev.data[0][prev.index])

      return !(amITheOne && didFullscreenChange) && didStylesChange && didIupdate
    }
  )})
)(ShitpostList)
