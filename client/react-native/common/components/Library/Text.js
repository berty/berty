import React from 'react'
import { View, Text as TextNative } from 'react-native'
import { Icon } from '.'
import {
  tinyText,
  smallText,
  mediumText,
  largeText,
  bigText,
  textCenter,
  textLeft,
  textRight,
  textMiddle,
  textTop,
  textBottom,
  bold,
  shadow
} from '../styles'
import { colors } from '../constants'

const reverse = props =>
  Object.keys(props)
    .reverse()
    .reduce((reversed, key) => {
      reversed[key] = props[key]
      return reversed
    }, {})

const find = ({ inside, from, or }) => {
  const key = Object.keys(inside).find(
    inKey =>
      Object.keys(from).some(fromKey => fromKey === inKey) && !!inside[inKey]
  )
  return from[key] || from[or]
}

const getPadding = (
  props,
  paddings = {
    tiny: 4,
    small: 6,
    medium: 8,
    large: 10,
    big: 12
  }
) => {
  const padding = find({ inside: props, from: paddings, or: 'small' })
  return {
    padding,
    paddingTop: padding / 3,
    paddingBottom: padding / 3
  }
}

const getBorderRadius = (
  props,
  radiuses = {
    tiny: 2,
    small: 3,
    medium: 4,
    large: 5,
    big: 6
  }
) => {
  const borderRadius = props.rounded
    ? find({ inside: props, from: radiuses, or: 'small' })
    : 0
  return {
    borderRadius
  }
}

const getSize = (
  props,
  sizes = {
    tiny: tinyText,
    small: smallText,
    medium: mediumText,
    large: largeText,
    big: bigText
  }
) => find({ inside: props, from: sizes, or: 'small' })

const getIconSize = (
  props,
  sizes = {
    tiny: smallText,
    small: mediumText,
    medium: largeText,
    large: largeText,
    big: bigText
  }
) => find({ inside: props, from: sizes, or: 'small' })

const getHorizAlign = (
  props,
  aligns = {
    center: textCenter,
    left: textLeft,
    right: textRight
  }
) => find({ inside: props, from: aligns, or: 'center' })

const getVertiAlign = (
  props,
  aligns = {
    middle: textMiddle,
    top: textTop,
    bottom: textBottom
  }
) => find({ inside: props, from: aligns, or: 'middle' })

const getColor = ({ background, color }) => ({
  color: colors[color] || color || (background ? colors.white : colors.textGrey)
})

const getWeight = props => props.bold && bold

export const BackgroundText = props => {
  const { background, children } = props
  return (
    <View
      style={[
        {
          backgroundColor:
            (background === true && colors.blackGrey) ||
            background ||
            colors.transparent
        },
        getBorderRadius(props),
        getPadding(props),
        props.shadow && shadow
      ]}
    >
      {children}
    </View>
  )
}

export const ForegroundText = props => {
  const { icon, style, children, ellipsizeMode, numberOfLines } = props
  const [vertical, horizontal, size, iconSize, weight, color] = [
    getVertiAlign(props),
    getHorizAlign(props),
    getSize(props),
    getIconSize(props),
    getWeight(props),
    getColor(props)
  ]
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
      {icon && typeof icon === 'string' ? (
        <Icon
          name={icon}
          style={[vertical, horizontal, iconSize, weight, color, style]}
        />
      ) : (
        icon
      )}
      <TextNative
        style={[vertical, horizontal, size, weight, color, style]}
        ellipsizeMode={ellipsizeMode}
        numberOfLines={numberOfLines}
      >
        {icon && '  '}
        {children}
      </TextNative>
    </View>
  )
}

export const Text = props => {
  props = reverse(props)
  const { background } = props
  return background ? (
    <BackgroundText {...props}>
      <ForegroundText {...props} />
    </BackgroundText>
  ) : (
    <ForegroundText {...props} />
  )
}

export default Text
