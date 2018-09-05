import React, { Component, Fragment } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native'
import { Separator, CustomTextInput, Icon, Text } from '.'
import Flex from './Flex'
import { largeText, margin, marginTopLeft, marginTop } from '../../styles'
import { colors } from '../../constants'

export default class Menu extends Component {
  static Section = ({ icon, title, children, style, ...props }) => (
    <View
      style={[
        {
          width: '100%',
          backgroundColor: 'transparent',
        },
        marginTop,
        !icon && !title && { marginTop: 32 },
        style,
      ]}
    >
      <Flex.Cols style={[marginTopLeft]}>
        <Flex.Cols size={1} space='start'>
          {title && (
            <Text small icon={icon} style={{ marginBottom: 7 }} {...props}>
              {title}
            </Text>
          )}
        </Flex.Cols>
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
      { icon, title, style, color, children, onPress, onDelete } = this.props
    ) {
      return (
        <Fragment>
          <TouchableOpacity
            style={[{ width: '100%', backgroundColor: colors.white }, style]}
            onPress={onPress}
          >
            <Flex.Cols>
              <Flex.Cols style={margin} size={7} space='start'>
                {children || (
                  <Text small left icon={icon} color={color || colors.textGrey}>
                    {title}
                  </Text>
                )}
              </Flex.Cols>
              {onDelete && (
                <TouchableOpacity onPress={this._delete(onDelete)}>
                  <Flex.Rows style={margin} self='right'>
                    {this.state.delete ? (
                      <ActivityIndicator color={color || colors.textGrey} />
                    ) : (
                      <Icon
                        name='trash-2'
                        style={[{ color: color || colors.textGrey }, largeText]}
                      />
                    )}
                  </Flex.Rows>
                </TouchableOpacity>
              )}
              {onPress && (
                <Flex.Rows style={margin} self='right'>
                  <Icon
                    name='chevron-right'
                    style={{ color: color || colors.textGrey }}
                  />
                </Flex.Rows>
              )}
            </Flex.Cols>
          </TouchableOpacity>
          <Separator />
        </Fragment>
      )
    }
  }

  static Input = ({ icon, style, ...props }) => (
    <Fragment>
      <Flex.Rows size={1} space='start'>
        {icon && <Icon name={icon} style={largeText} />}
        <CustomTextInput
          {...props}
          style={[{ width: '100%', backgroundColor: colors.white }, style]}
        />
      </Flex.Rows>
      <Separator />
    </Fragment>
  )

  render () {
    const { style, absolute } = this.props
    return (
      <ScrollView
        style={[{ width: '100%' }, style, absolute && StyleSheet.absoluteFill]}
      >
        {this.props.children}
      </ScrollView>
    )
  }
}
