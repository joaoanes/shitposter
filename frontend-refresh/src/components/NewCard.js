import React, { useState, useEffect } from 'react'
import useDimensions from "react-use-dimensions";

const NewCard = ({children, index, fullscreen, setItemFullscreen, modifyItemSize, longSide = "width", initialLongSizeLength = 900, maxHeight, minWidth = 600}) => {
  const [longSideLength, setLongSideLength] = useState(initialLongSizeLength - 40)
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
      <div style={fullscreen ? {} : {...styles.wrapper, minWidth: minWidth} }>
        <div style={styles.container} onClick={() => setItemFullscreen()}>
          {
            children
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
    borderRadius: 100,
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
    height: 40,
    position: "absolute",
    width: "100%",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  wrapper: {maxHeight: 300, minHeight: 300}
}

export default NewCard;
