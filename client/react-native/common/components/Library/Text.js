import { Text as TextNative, TextInput, StyleSheet, View } from 'react-native'
import React, { Fragment, PureComponent } from 'react'
import hash from 'object-hash'

import Icon from './Icon'
import Flex from './Flex'
import { colors } from '../../constants'
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

const reverse = props =>
  Object.keys(props)
    .reverse()
    .reduce((reversed, key) => {
      reversed[key] = props[key]
      return reversed
    }, {})

const find = ({ inside, from, or }) =>
  from[Object.keys(inside).find(key => !!from[key]) || or]

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
    case 'number':
      break
    case 'string':
      padding = paddings[padding]
      break
    case 'object':
      return StyleSheet.create({
        style: Object.keys(padding).reduce((a, key) => {
          a[`padding${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
            padding[key]
          return a
        }, {}),
      }).style
    default:
      return null
  }
  return StyleSheet.create({
    style: {
      paddingVertical: props.rounded === 'circle' ? padding : padding / 3,
      paddingHorizontal: padding,
    },
  }).style
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
  props.children || props.input
    ? StyleSheet.create({
      style: {
        marginRight: find({ inside: props, from: margins, or: 'small' }),
      },
    }).style
    : null

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
  } else if (typeof props.rounded === 'number') {
    borderRadius = props.rounded
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

const getColor = ({ background, color }) =>
  StyleSheet.create({
    style: {
      color:
        colors[color] || color || (background ? colors.white : colors.textGrey),
    },
  }).style

const getOpacity = ({ opacity }) => ({
  opacity: opacity == null ? 1 : opacity,
})

const getWeight = props => (props.bold ? bold : null)

const getJustify = (
  props,
  justify = {
    center: 'center',
    left: 'start',
    right: 'end',
    stretch: 'stretch',
  }
) => find({ inside: props, from: justify, or: undefined })

const getAlign = (
  props,
  align = {
    middle: 'center',
    top: 'start',
    right: 'end',
    stretch: 'stretch',
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
    case 'number':
      return { margin: props.margin }
    case 'boolean':
      return margin
    case 'string':
      return margins[props.margin]
    case 'object':
      return Array.isArray(props.margin)
        ? props.margin.reduce((a, key) => {
          a[`margin${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
              margins[key]
          return a
        }, {})
        : Object.keys(margins).reduce((a, key) => {
          a[`margin${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
              props.margin[key]
          return a
        }, {})
    default:
      return null
  }
}

const getHeight = props => {
  let { multiline, height, lineHeight } = props

  if (!height && !lineHeight) {
    return null
  } else if (!lineHeight && typeof multiline === 'number') {
    lineHeight = height / multiline
  } else if (!lineHeight && !multiline) {
    lineHeight = height
  }
  return StyleSheet.create({
    height: {
      height,
      lineHeight,
    },
  }).height
}

export class BackgroundText extends PureComponent {
  static styles = {}
  static getStyles = ({
    icon,
    input,
    children,
    ellipsis,
    onPress,
    onSubmit,
    ...props
  }) => {
    const propsHash = hash({ props, children: !!children, input: !!input })
    if (BackgroundText.styles[propsHash]) {
      return BackgroundText.styles[propsHash]
    }
    const { background, height, absolute } = props
    BackgroundText.styles[propsHash] = [
      StyleSheet.create({
        style: {
          position: absolute && 'absolute',
          ...(typeof absolute === 'object' ? absolute : {}),
          backgroundColor:
            (background === true && colors.blackGrey) ||
            background ||
            colors.transparent,
          height,
        },
      }).style,
      getBorderRadius(props),
      getPadding(props),
      getMargin(props),
      getOpacity(props),
      props.shadow && shadow,
    ]
    return BackgroundText.styles[propsHash]
  }

  render () {
    const { children, size, justify, align, self } = this.props
    const flexProps = {
      size,
      justify: justify || getJustify(this.props),
      align: align || getAlign(this.props),
      self,
    }
    return (
      <Flex.Cols
        {...flexProps}
        style={BackgroundText.getStyles(this.props)}
        onPress={this.props.onPress}
      >
        {children}
      </Flex.Cols>
    )
  }
}

export class ForegroundText extends PureComponent {
  static styles = {}
  static getStyles = ({
    icon,
    input,
    children,
    ellipsis,
    onPress,
    onSubmit,
    ...props
  }) => {
    const propsHash = hash({ props, children: !!children, input: !!input })
    if (ForegroundText.styles[propsHash] != null) {
      return ForegroundText.styles[propsHash]
    }
    const [
      vertical,
      horizontal,
      size,
      iconSize,
      weight,
      color,
      iconPadding,
      height,
    ] = [
      getVertiAlign(props),
      getHorizAlign(props),
      getSize(props),
      getIconSize(props),
      getWeight(props),
      getColor(props),
      getIconPadding({ ...props, children, input }),
      getHeight(props),
    ]
    ForegroundText.styles[propsHash] = {
      iconView: [{ height: props.height }, iconPadding],
      icon: [
        iconSize,
        weight,
        color,
        vertical,
        horizontal,
        iconPadding,
        height,
      ],
      text: [size, weight, color, vertical, horizontal, height],
      input: [size, weight, color, vertical, horizontal, height, { flex: 1 }],
    }
    return ForegroundText.styles[propsHash]
  }

  focus () {
    this._input.focus()
  }

  blur () {
    this._input.blur()
  }

  render () {
    const { icon, input, children, multiline, onSubmit, onChangeText, value, flip } = this.props
    const numberOfLines = typeof multiline === 'number' ? multiline : undefined

    const styles = ForegroundText.getStyles(this.props)
    return (
      <Fragment>
        {icon && typeof icon === 'string' ? (
          <Icon name={icon} style={styles.icon} flip={flip} />
        ) : <View>{icon}</View>}
        {input ? (
          <TextInput
            {...(typeof input === 'object' ? input : {})}
            style={styles.input}
            placeholder={children || input.placeholder}
            autoFocus={!!input.autoFocus}
            placeholderTextColor={colors.subtleGrey}
            onSubmitEditing={onSubmit}
            onChangeText={onChangeText || (() => {})}
            multiline={!!multiline}
            numberOfLines={numberOfLines}
            value={value}
            ref={c => (this._input = c)}
          />
        ) : (
          <TextNative
            className={multiline ? 'textBreak' : 'textEllipsis'}
            style={styles.text}
            ellipsizeMode={!multiline ? 'tail' : undefined}
            numberOfLines={numberOfLines}
          >
            {children}
          </TextNative>
        )}
      </Fragment>
    )
  }
}

export class Text extends React.PureComponent {
  focus () {
    this._text.focus()
  }

  blur () {
    this._text.blur()
  }

  render () {
    const props = reverse(this.props)

    return (
      <BackgroundText {...props}>
        <ForegroundText {...props} ref={c => (this._text = c)} />
      </BackgroundText>
    )
  }
}

export default Text
