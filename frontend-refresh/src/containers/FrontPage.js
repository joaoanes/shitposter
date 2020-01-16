import React from "react"
import AutoSizer from "react-virtualized-auto-sizer"

import NewCard from "../components/NewCard"
import NewShitpostList from "./NewShitpostList"

export const FrontPage = (props) => {
  return (
    <div style={{position: 'absolute', top: 150, bottom: 50, left: 0, right: 0}}>
      <NewCard height={"100%"}>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}>
          <AutoSizer>
          {
            ({width, height}) =>
              <NewShitpostList width={width} height={height} {...props} />
          }
          </AutoSizer>
        </div>
      </NewCard>
    </div>
  )
}
