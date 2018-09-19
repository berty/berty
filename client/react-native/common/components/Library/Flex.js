import React from 'react'
import { View } from 'react-native'

const getDirection = (key, directions = { rows: 'column', cols: 'row' }) =>
  directions[key] || null

const getAlign = (
  key,
  align = {
    top: 'flex-start',
    left: 'flex-start',
    right: 'flex-end',
    bottom: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  }
) => align[key] || align['center']

const getJustify = (
  key,
  justify = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    around: 'space-around',
    between: 'space-between',
    evenly: 'space-evenly',
  }
) => justify[key] || justify['center']

export const Block = ({
  size = 1,
  direction,
  align,
  self,
  justify,
  children,
  style,
  ...props
}) => (
  <View
    style={[
      {
        flex: size,
        flexDirection: direction && getDirection(direction),
        alignItems: align && getAlign(align),
        alignSelf: self && getAlign(self),
        justifyContent: justify && getJustify(justify),
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
)

export const Grid = props => <Block {...props} />

export const Rows = ({ direction, ...props }) => (
  <Block direction='rows' {...props} />
)

export const Cols = ({ direction, ...props }) => (
  <Block direction='cols' {...props} />
)

export default {
  Grid,
  Rows,
  Cols,
  Block,
}
