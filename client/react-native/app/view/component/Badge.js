import React from 'react'
import Flex from './Flex'
import Text from './Text'
import { colors } from '@berty/common/constants'

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
    small: props.icon ? 28 : 18,
    medium: props.icon ? 34 : 25,
    large: props.icon ? 38 : 30,
    big: props.icon ? 49 : 39,
  }
) => find({ inside: props, from: sizes, or: 'small' })

const getPadding = (
  props,
  paddings = {
    tiny: 1,
    small: 2,
    medium: 7,
    large: 9,
    big: 12,
  }
) => find({ inside: props, from: paddings, or: 'small' })

const getHorizAbsol = (
  props,
  size = getSize(props),
  positions = {
    top: { top: 0 },
    bottom: { bottom: 0 },
  }
) => find({ inside: props, from: positions, or: 'top' })

const getVertiAbsol = (
  props,
  size = getSize(props),
  positions = {
    left: { left: 0 },
    right: { right: 0 },
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
    typeof props.getSize === 'function' ? props.getSize(props) : getSize(props),
    typeof props.getPadding === 'function'
      ? props.getPadding(props)
      : getPadding(props),
    { ...getHorizAbsol(props), ...getVertiAbsol(props) },
  ]

  return (
    <Flex.Rows justify={vertiPos} align={horizPos} style={{ padding }}>
      {children}
      <Text
        icon={value == null && icon}
        height={size}
        padding={padding}
        middle
        center
        rounded='circle'
        absolute={absolute}
        background={background || colors.white}
        color={color || colors.white}
        {...otherProps}
      >
        {value != null && value}
      </Text>
    </Flex.Rows>
  )
}

export default Badge
