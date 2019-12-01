import React, { useState, useEffect, useRef } from 'react'
import { CircularProgress } from '@material-ui/core/'

const loadingStyles = {
  wrapper: {
    width: "100%",
    height: 300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey'
  }
}

const LoadingCard = () => (
  <div style={loadingStyles.wrapper}>
    <CircularProgress color="secondary" />
  </div>
)


const NewCard = ({children, index, OverlayComponent, fullscreen, setItemFullscreen, modifyItemSize, longSide = "width", initialLongSizeLength = 900, maxHeight, minWidth = 600}) => {
  const [longSideLength, setLongSideLength] = useState(initialLongSizeLength - 40)

  const [isLoading, setLoading] = useState(true)
  const currentLoadingTimeout = useRef(0)
  useEffect(() => {
    clearTimeout(currentLoadingTimeout.current)
    currentLoadingTimeout.current = setTimeout(() => setLoading(false), 250)

    return () => clearTimeout(currentLoadingTimeout.current)
  }, [children])

  const sizeStyles = longSide === "width" ?
    { width: longSideLength } :
    { height: longSideLength }

  // const [ref, dimensions] = useDimensions();
  // const [previousDimensions, setPreviousDimensions] = useState(dimensions);

  // useEffect(() => {
  //   if (dimensions.y !== previousDimensions.y && modifyItemSize && dimensions.y > 0) {
  //     console.log(index, "is", dimensions.y)
  //     modifyItemSize(dimensions.y)
  //     setPreviousDimensions(dimensions)
  //   }
  // }, [dimensions, previousDimensions.y, modifyItemSize, index])

  return (
    <div style={{...styles.newCard}}>
      {OverlayComponent ? <OverlayComponent /> : null}
      <div style={fullscreen ? {} : {...styles.wrapper, minWidth: minWidth} }>
        <div style={styles.container} onClick={() => setItemFullscreen()}>
          {
            isLoading ? <LoadingCard /> : children
          }
        </div>
      </div>
      <div style={fullscreen ? styles.innerContainer : styles.floaterContainer}>
        hello!
      </div>
    </div>
  )
}

const styles = {
  newCard: {
    border: "1px solid grey",
    borderRadius: 30,
    margin: 20,
    overflow: "hidden",
    position: 'relative',
  },
  container: {
    display: "flex",
    justifyContent: "center",
  },
  innerContainer: {
    height: 80,
    backgroundColor: "black",
    width: "100%"
  },
  floaterContainer: {
    display: "none"
  },
  wrapper: {
    maxHeight: 300,
    minHeight: 300,
  }
}

export default NewCard;
