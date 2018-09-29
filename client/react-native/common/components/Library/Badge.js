import React from 'react'
import { Flex, Text } from '.'
import { colors } from '../../constants'

const find = ({ inside, from, or }) => {
  const key = Object.keys(inside).find(
    inKey =>
      Object.keys(from).some(fromKey => fromKey === inKey) && !!inside[inKey]
  )
  return from[key] || from[or]
}

const getVertiPos = (
  props,
  positions = {
    top: 'start',
    bottom: 'end',
  }
) => find({ inside: props, from: positions, or: 'top' })

const getHorizPos = (
  props,
  positions = {
    left: 'start',
    right: 'end',
  }
) => find({ inside: props, from: positions, or: 'right' })

const getSize = (
  props,
  sizes = {
    tiny: props.icon ? 20 : 14,
    small: props.icon ? 28 : 20,
    medium: props.icon ? 34 : 25,
    large: props.icon ? 38 : 30,
    big: props.icon ? 49 : 39,
  }
) => find({ inside: props, from: sizes, or: 'small' })

const getPadding = (
  props,
  paddings = {
    tiny: 2,
    small: 3,
    medium: 4,
    large: 5,
    big: 6,
  }
) => find({ inside: props, from: paddings, or: 'small' })

const getHorizAbsol = (
  props,
  padding = getPadding(props),
  positions = {
    top: { top: -padding },
    bottom: { bottom: -padding },
  }
) => find({ inside: props, from: positions, or: 'top' })

const getVertiAbsol = (
  props,
  padding = getPadding(props),
  positions = {
    left: { left: -padding },
    right: { right: -padding },
  }
) => find({ inside: props, from: positions, or: 'right' })

const Badge = props => {
  const {
    background,
    color,
    value,
    icon,
    children,
    top,
    bottom,
    left,
    right,
    height,
    ...otherProps
  } = props
  const [horizPos, vertiPos, size, padding, absolute] = [
    getHorizPos(props),
    getVertiPos(props),
    getSize(props),
    getPadding(props),
    { ...getHorizAbsol(props), ...getVertiAbsol(props) },
  ]
  if (value == null && !icon) {
    return children
  }
  return (
    <Flex.Rows justify={vertiPos} align={horizPos} style={{ padding }}>
      {children}
      <Text
        icon={value == null && icon}
        height={size}
        padding
        middle
        center
        rounded='circle'
        absolute={absolute}
        background={background || colors.red}
        color={color || colors.white}
        {...otherProps}
      >
        {value != null && value}
      </Text>
    </Flex.Rows>
  )
}

export default Badge
