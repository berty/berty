import React, { Component, Fragment } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native'
import { Separator, CustomTextInput, Icon, Text } from '.'
import { Row, Col } from './Flex'
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
      <Row style={[marginTopLeft]}>
        <Row flex={1} justifyContent='flex-start'>
          {title && (
            <Text small icon={icon} style={{ marginBottom: 7 }} {...props}>
              {title}
            </Text>
          )}
        </Row>
      </Row>
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

    render = (
      { icon, title, style, children, onPress, onDelete } = this.props
    ) => {
      return (
        <Fragment>
          <TouchableOpacity
            style={[{ width: '100%', backgroundColor: colors.white }, style]}
            onPress={onPress}
          >
            <Row>
              <Row style={margin} flex={7} justifyContent='flex-start'>
                {children || (
                  <Text small icon={icon}>
                    {title}
                  </Text>
                )}
              </Row>
              {onDelete && (
                <TouchableOpacity onPress={this._delete(onDelete)}>
                  <Col style={margin} alignSelf='flex-end'>
                    {this.state.delete ? (
                      <ActivityIndicator color={colors.textGrey} />
                    ) : (
                      <Icon name='trash-2' style={largeText} />
                    )}
                  </Col>
                </TouchableOpacity>
              )}
              {onPress && (
                <Col style={margin} alignSelf='flex-end'>
                  <Icon name='chevron-right' style={largeText} />
                </Col>
              )}
              {}
            </Row>
          </TouchableOpacity>
          <Separator />
        </Fragment>
      )
    }
  }

  static Input = ({ icon, style, ...props }) => (
    <Fragment>
      <Row flex={1} justifyContent='flex-start'>
        {icon && <Icon name={icon} style={largeText} />}
        <CustomTextInput
          {...props}
          style={[{ width: '100%', backgroundColor: colors.white }, style]}
        />
      </Row>
      <Separator />
    </Fragment>
  )

  render = () => {
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
