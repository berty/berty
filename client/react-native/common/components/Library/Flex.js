import React from 'react'
import { View, TouchableOpacity } from 'react-native'

const getDirection = (key, directions = { rows: 'column', cols: 'row' }) =>
  directions[key] || null

const getAlign = (
  key,
  align = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
  }
) => align[key] || align['stretch']

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
}) => {
  style = [
    {
      flex: size,
      flexDirection: direction && getDirection(direction),
      alignItems: align && getAlign(align),
      alignSelf: self && getAlign(self),
      justifyContent: justify && getJustify(justify),
    },
    style,
  ]
  return props.onPress ? (
    <TouchableOpacity {...props} style={style}>
      {children}
    </TouchableOpacity>
  ) : (
    <View {...props} style={style}>
      {children}
    </View>
  )
}

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
