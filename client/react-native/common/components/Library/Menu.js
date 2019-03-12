import React, { Component, Fragment } from 'react'
import { ActivityIndicator, StyleSheet, ScrollView, View } from 'react-native'
import Flex from './Flex'
import Separator from './Separator'
import Text from './Text'

import {
  marginTopLeft,
  paddingLeft,
  paddingHorizontal,
  padding,
} from '../../styles'
import { colors } from '../../constants'
import { isRTL } from '../../i18n'

export default class Menu extends Component {
  static Header = ({ icon, title, description }) => (
    <Flex.Cols style={[{ marginTop: 33 }, paddingHorizontal]} align='center'>
      {icon && (
        <Flex.Rows size={1} align={title ? 'end' : 'center'}>
          {icon}
        </Flex.Rows>
      )}
      {title && (
        <Flex.Rows
          size={3}
          justify='between'
          style={[paddingLeft, { height: 42 }]}
        >
          <Text medium color={colors.black}>
            {title}
          </Text>
          {description && (
            <Text tiny color={colors.subtleGrey}>
              {description}
            </Text>
          )}
        </Flex.Rows>
      )}
    </Flex.Cols>
  )

  static Section = ({
    icon,
    title,
    children,
    style,
    customMarginTop,
    ...props
  }) => (
    <View style={[style]}>
      <Flex.Cols
        style={[
          marginTopLeft,
          {
            marginBottom: 8,
            marginTop: customMarginTop || 32,
          },
        ]}
      >
        {title && (
          <Text small icon={icon} {...props}>
            {title}
          </Text>
        )}
      </Flex.Cols>
      <Separator />
      {children}
    </View>
  )

  static Item = class Item extends Component {
    state = {
      delete: false,
    }

    _delete = callback => () =>
      this.setState({ delete: true }, async () => {
        callback && (await callback(this.props))
        this.setState({ delete: false })
      })

    render (
      {
        icon,
        input,
        value,
        title,
        style,
        color,
        children,
        onPress,
        onChangeText,
        onDelete,
        boldLeft,
        boldRight,
        textRight,
        customRight,
        ...otherProps
      } = this.props
    ) {
      return (
        <Fragment>
          <Flex.Cols
            style={[{ backgroundColor: colors.white }, padding]}
            onPress={onPress}
          >
            <Flex.Cols justify='start' size={5}>
              {children || (
                <Text
                  input={input}
                  value={value}
                  left
                  small
                  icon={icon}
                  color={color || colors.textBlack}
                  align='center'
                  onChangeText={onChangeText}
                  bold={boldLeft ? true : null}
                  {...otherProps}
                >
                  {title}
                </Text>
              )}
            </Flex.Cols>
            {onDelete &&
              (this.state.delete ? (
                <ActivityIndicator color={color || colors.textGrey} />
              ) : (
                <Text
                  icon='trash-2'
                  color={color}
                  large
                  right
                  onPress={this.delete(onDelete)}
                />
              ))}
            {onPress && (
              <Text
                icon='chevron-right'
                color={color}
                large
                right
                bold={boldRight ? true : null}
                justify='end'
                flip={isRTL()}
              />
            )}
            {textRight && (
              <Text
                color={color}
                small
                right
                justify='end'
                bold={boldRight ? true : null}
                ellipsis
              >
                {textRight}
              </Text>
            )}
            {customRight}
          </Flex.Cols>
          <Separator />
        </Fragment>
      )
    }
  }

  static Input = props => <Menu.Item {...props} input />

  render () {
    const { style, absolute } = this.props
    return (
      <ScrollView style={[style, absolute && StyleSheet.absoluteFill]}>
        {this.props.children}
        <View style={[padding]} />
      </ScrollView>
    )
  }
}
