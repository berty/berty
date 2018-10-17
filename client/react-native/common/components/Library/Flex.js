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

const getStyle = ({ size = 1, direction, align, self, justify, style }) => [
  {
    flex: size,
    flexDirection: direction && getDirection(direction),
    alignItems: align && getAlign(align),
    alignSelf: self && getAlign(self),
    justifyContent: justify && getJustify(justify),
  },
  style,
]

const getProps = ({
  size = 1,
  direction,
  align,
  self,
  justify,
  style,
  ...props
}) => props

export const Block = props => {
  return props.onPress ? (
    <TouchableOpacity {...getProps(props)} style={getStyle(props)} />
  ) : (
    <View {...getProps(props)} style={getStyle(props)} />
  )
}

export const Rows = ({ direction, ...props }) => {
  props.direction = 'rows'
  return props.onPress ? (
    <TouchableOpacity {...getProps(props)} style={getStyle(props)} />
  ) : (
    <View {...getProps(props)} style={getStyle(props)} />
  )
}

export const Cols = ({ direction, ...props }) => {
  props.direction = 'cols'
  return props.onPress ? (
    <TouchableOpacity {...getProps(props)} style={getStyle(props)} />
  ) : (
    <View {...getProps(props)} style={getStyle(props)} />
  )
}

export default {
  Rows,
  Cols,
  Block,
}
