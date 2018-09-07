import React from 'react'
import {
  TouchableOpacity,
  View,
  Text as TextNative,
  TextInput,
} from 'react-native'
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
  shadow,
  margin,
} from '../../styles'
import { colors } from '../../constants'

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
    big: 12,
  }
) => {
  let padding = props.padding
  if (typeof padding === 'boolean') {
    padding = find({ inside: props, from: paddings, or: 'small' })
  }
  return {
    padding,
    paddingTop: padding / 3,
    paddingBottom: padding / 3,
  }
}

const getBorderRadius = (
  props,
  radiuses = {
    tiny: 2,
    small: 3,
    medium: 4,
    large: 5,
    big: 6,
  }
) => {
  let borderRadius = props.rounded || 0
  if (typeof borderRadius === 'boolean') {
    borderRadius = find({ inside: props, from: radiuses, or: 'small' })
  }
  return {
    borderRadius,
  }
}

const getSize = (
  props,
  sizes = {
    tiny: tinyText,
    small: smallText,
    medium: mediumText,
    large: largeText,
    big: bigText,
  }
) => find({ inside: props, from: sizes, or: 'small' })

const getIconSize = (
  props,
  sizes = {
    tiny: smallText,
    small: mediumText,
    medium: largeText,
    large: largeText,
    big: bigText,
  }
) => find({ inside: props, from: sizes, or: 'small' })

const getHorizAlign = (
  props,
  aligns = {
    center: textCenter,
    left: textLeft,
    right: textRight,
  }
) => find({ inside: props, from: aligns, or: 'center' })

const getVertiAlign = (
  props,
  aligns = {
    middle: textMiddle,
    top: textTop,
    bottom: textBottom,
  }
) => find({ inside: props, from: aligns, or: 'middle' })

const getColor = ({ background, color }) => ({
  color:
    colors[color] || color || (background ? colors.white : colors.textGrey),
})

const getWeight = props => props.bold && bold

const getJustify = (
  props,
  justify = {
    center: 'center',
    left: 'flex-start',
    right: 'flex-end',
  }
) => find({ inside: props, from: justify, or: 'center' })

export const BackgroundText = props => {
  const { background, children, button, onPress } = props
  const style = [
    {
      backgroundColor:
        (background === true && colors.blackGrey) ||
        background ||
        colors.transparent,
    },
    getBorderRadius(props),
    getPadding(props),
    props.shadow && shadow,
    props.margin && typeof props.margin === 'boolean'
      ? margin
      : { margin: props.margin },
    props.flex && typeof props.flex === 'boolean'
      ? { flex: 1 }
      : { flex: props.flex },
  ]
  return button ? (
    <TouchableOpacity style={style} onPress={onPress}>
      {children}
    </TouchableOpacity>
  ) : (
    <View style={style}>{children}</View>
  )
}

export const ForegroundText = props => {
  const {
    icon,
    input,
    style,
    children,
    ellipsizeMode,
    numberOfLines,
    height,
  } = props
  const [vertical, horizontal, size, iconSize, weight, color] = [
    getVertiAlign(props),
    getHorizAlign(props),
    getSize(props),
    getIconSize(props),
    getWeight(props),
    getColor(props),
  ]
  return (
    <View
      style={{
        flexDirection: 'row',
        flex: 1,
        justifyContent: getJustify(props),
      }}
    >
      {icon && typeof icon === 'string' ? (
        <Icon
          name={icon}
          style={[
            iconSize,
            weight,
            color,
            style,
            vertical,
            horizontal,
            { height },
            { lineHeight: height },
          ]}
        />
      ) : (
        icon
      )}
      {input ? (
        <TextInput
          {...input}
          style={[
            size,
            weight,
            color,
            style,
            vertical,
            horizontal,
            { flex: 1 },
            { height },
            { lineHeight: height },
          ]}
          value={children || input.value}
        />
      ) : (
        <TextNative
          style={[
            size,
            weight,
            color,
            style,
            vertical,
            horizontal,
            { height },
            { lineHeight: height },
          ]}
          ellipsizeMode={ellipsizeMode}
          numberOfLines={numberOfLines}
        >
          {icon && '  '}
          {children}
        </TextNative>
      )}
    </View>
  )
}

export const Text = props => {
  props = reverse(props)
  return (
    <BackgroundText {...props}>
      <ForegroundText {...props} />
    </BackgroundText>
  )
}

export default Text
