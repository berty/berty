import React, { Fragment } from 'react'
import { View, Text as TextNative, TextInput, Platform } from 'react-native'
import { Icon, Flex } from '.'
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
  marginTop,
  marginRight,
  marginLeft,
  marginBottom,
  marginHorizontal,
  marginVertical,
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
  switch (typeof padding) {
    case 'boolean':
      padding = find({ inside: props, from: paddings, or: 'small' })
      break
    case 'string':
      padding = paddings[padding]
      break
    case 'object':
      return Object.keys(padding).reduce((a, key) => {
        a[`padding${key.charAt(0).toUpperCase()}${key.slice(1)}`] = padding[key]
        return a
      }, {})
    default:
      return null
  }
  return {
    paddingVertical: props.rounded === 'circle' ? padding : padding / 3,
    paddingHorizontal: padding,
  }
}

const getIconPadding = (
  props,
  margins = {
    tiny: 5,
    small: 7,
    medium: 8,
    large: 10,
    big: 12,
  }
) =>
  (props.children || props.input) && {
    marginRight: find({ inside: props, from: margins, or: 'small' }),
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
  if (borderRadius === 'circle') {
    borderRadius = props.height / 2
  } else if (typeof borderRadius === 'boolean') {
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

const getOpacity = ({ opacity }) => ({
  opacity: opacity == null ? 1 : opacity,
})

const getWeight = props => props.bold && bold

const getJustify = (
  props,
  justify = {
    center: 'center',
    left: 'start',
    right: 'end',
  }
) => find({ inside: props, from: justify, or: undefined })

const getAlign = (
  props,
  align = {
    middle: 'center',
    top: 'start',
    right: 'end',
  }
) => find({ inside: props, from: align, or: undefined })

const getMargin = (
  props,
  margins = {
    top: marginTop,
    left: marginLeft,
    right: marginRight,
    bottom: marginBottom,
    horizontal: marginHorizontal,
    vertical: marginVertical,
  }
) => {
  switch (typeof props.margin) {
    case 'boolean':
      return margin
    case 'string':
      return margins[props.margin]
    case 'object':
      return Object.keys(margins).reduce((a, key) => {
        a[`margin${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
          props.margin[key]
        return a
      }, {})
    default:
      return null
  }
}

export const BackgroundText = props => {
  const {
    background,
    children,
    height,
    size,
    justify,
    align,
    self,
    onPress,
    absolute,
  } = props
  const styleProp = [
    {
      position: absolute && 'absolute',
      ...(typeof absolute === 'object' ? absolute : {}),
      backgroundColor:
        (background === true && colors.blackGrey) ||
        background ||
        colors.transparent,
      height,
    },
    getBorderRadius(props),
    getPadding(props),
    getMargin(props),
    getOpacity(props),
    props.shadow && shadow,
  ]
  const flexProps = {
    size,
    justify: justify || getJustify(props),
    align: align || getAlign(props),
    self,
  }
  return (
    <Flex.Cols {...flexProps} style={styleProp} onPress={onPress}>
      {children}
    </Flex.Cols>
  )
}

export const ForegroundText = props => {
  const { icon, input, children, height, ellipsis, onSubmit } = props
  const [vertical, horizontal, size, iconSize, weight, color, iconPadding] = [
    getVertiAlign(props),
    getHorizAlign(props),
    getSize(props),
    getIconSize(props),
    getWeight(props),
    getColor(props),
    getIconPadding(props),
  ]
  return (
    <Fragment>
      {icon && typeof icon === 'string' ? (
        <Icon
          name={icon}
          style={[
            iconSize,
            weight,
            color,
            vertical,
            horizontal,
            iconPadding,
            { height, lineHeight: height },
          ]}
        />
      ) : (
        icon && <View style={[{ height }, iconPadding]}>{icon}</View>
      )}
      {input ? (
        <TextInput
          {...(typeof input === 'object' ? input : {})}
          style={[
            size,
            weight,
            color,
            vertical,
            horizontal,
            { height, lineHeight: height },
            {
              ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
            },
            { flex: 1 },
          ]}
          placeholder={children || input.placeholder}
          placeholderTextColor={color.color}
          onSubmitEditing={onSubmit}
        />
      ) : (
        <TextNative
          className={ellipsis ? 'textEllipsis' : 'textBreak'}
          style={[
            size,
            weight,
            color,
            vertical,
            horizontal,
            { height, lineHeight: height },
          ]}
          ellipsizeMode={ellipsis && 'tail'}
          numberOfLines={ellipsis && 1}
        >
          {children}
        </TextNative>
      )}
    </Fragment>
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
