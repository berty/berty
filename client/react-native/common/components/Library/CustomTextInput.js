// @flow

import * as React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Icon } from '.'
import { colors, fonts } from '../../constants'
import { margin, largeText } from '../../styles'

import type { ViewStyle } from 'StyleSheetTypes'

type Props = {
  value?: string,
  secureTextEntry?: boolean,
  editable?: boolean,
  renderLeft?: () => React.Node,
  renderRight?: () => React.Node,
  error?: string,
  containerStyle?: ViewStyle,
  inputStyle?: ViewStyle,
  style?: ViewStyle,
  borderBottom?: number,
  borderRight?: number,
  borderTop?: number,
  borderLeft?: number,
  value?: string,
}

type State = {|
  passwordVisible: boolean,
|}

class CustomTextInput extends React.PureComponent<Props, State> {
  static defaultProps = {
    secureTextEntry: false,
    borderBottom: 0,
    borderRight: 0,
    borderTop: 0,
    borderLeft: 0,
  }

  state = {
    passwordVisible: false,
  }

  input: ?TextInput

  isFocused = () => this.input && this.input.isFocused()

  focus = () => {
    if (this.input) {
      this.input.focus()
    }
  }

  _togglePasswordVisibility = () => {
    this.setState(prevState => ({
      passwordVisible: !prevState.passwordVisible,
    }))
  }

  render () {
    const {
      renderLeft,
      renderRight,
      error,
      containerStyle,
      style,
      borderBottom,
      borderRight,
      borderTop,
      borderLeft,
      value,
      ...otherProps
    } = this.props

    const inputPadding = {
      paddingLeft: renderLeft ? 0 : 18,
      paddingRight: renderRight || this.props.secureTextEntry ? 0 : 18,
    }

    return (
      <React.Fragment>
        <View style={[styles.container, containerStyle]}>
          {renderLeft && renderLeft()}

          <TextInput
            ref={ref => (this.input = ref)}
            style={[styles.input, inputPadding, style]}
            placeholderTextColor={colors.subtleGrey}
            selectionColor={colors.subtleGrey}
            underlineColorAndroid={colors.transparent}
            disableFullscreenUI
            autoCorrect={false}
            borderBottomWidth={borderBottom ? 0.5 : 0}
            borderRightWidth={borderRight ? 0.5 : 0}
            borderTopWidth={borderTop ? 0.5 : 0}
            borderLeftWidth={borderLeft ? 0.5 : 0}
            borderColor={colors.borderGrey}
            {...otherProps}
            secureTextEntry={
              this.props.secureTextEntry && !this.state.passwordVisible
            }
          />

          {this.props.error !== undefined &&
            (!!this.props.value && this.props.value.length > 0) && (
            <Icon
              name={this.props.error === false ? 'check' : 'x'}
              style={[margin, largeText]}
            />
          )}

          {this.props.secureTextEntry ? (
            <TouchableOpacity
              disabled={otherProps.editable === false}
              onPress={this._togglePasswordVisibility}
              activeOpacity={0.5}
              style={{ backgroundColor: colors.white }}
            >
              <Icon
                name={this.state.passwordVisible ? 'eye-off' : 'eye'}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          ) : (
            renderRight && renderRight()
          )}
        </View>

        {this.props.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>Error</Text>
          </View>
        )}
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    minHeight: 56,
    fontFamily: fonts.regular,
    color: colors.textGrey,
    fontSize: 14,
    lineHeight: 24,
    width: 50,
  },
  eyeIcon: {
    color: colors.subtleGrey,
    padding: 15,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: colors.error,
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  error: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
  },
})

export default CustomTextInput
