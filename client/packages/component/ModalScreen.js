import { StackActions, withNavigation } from 'react-navigation'
import { View, Platform, TouchableOpacity } from 'react-native'
import React from 'react'

import Loader from './Loader'
import Button from './Button'
import colors from '@berty/common/constants/colors'

class ModalScreen extends React.PureComponent {
  componentDidMount() {
    if (Platform.OS === 'web') {
      if (this._keyboardListener === undefined) {
        this._keyboardListener = e => this.keyboardListener(e)
      }
      window.addEventListener('keyup', this._keyboardListener)
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'web') {
      window.removeEventListener('keyup', this._keyboardListener)
    }
  }

  keyboardListener(event) {
    if (
      (this.props.showDismiss || this.props.keyboardDismiss) &&
      event.key === 'Escape'
    ) {
      this.dismiss()
    }
  }

  render = () => {
    const {
      children,
      loading,
      showDismiss,
      width,
      footer,
      ...otherProps
    } = this.props

    return (
      <>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
          onPress={() =>
            (this.props.showDismiss || this.props.keyboardDismiss) &&
            this.dismiss()
          }
        >
          <View
            style={{
              backgroundColor:
                this.props.backgroundColor || colors.transparentGrey,
              flex: 1,
            }}
          />
        </TouchableOpacity>
        {!loading ? (
          <View
            style={{
              width: width || 320,
              position: 'absolute',
              flex: 1,
            }}
          >
            <View
              style={[
                {
                  backgroundColor: colors.white,
                  borderRadius: 10,
                },
              ]}
              {...otherProps}
            >
              {showDismiss ? (
                <View
                  style={{
                    flex: 1,
                    marginTop: 10,
                    marginRight: 10,
                    alignSelf: 'flex-end',
                    zIndex: 1,
                  }}
                >
                  <Button
                    onPress={() => this.dismiss()}
                    icon={'x'}
                    color={colors.fakeBlack}
                    large
                  />
                </View>
              ) : null}
              <View
                style={{
                  marginTop: -24,
                }}
              >
                {children}
              </View>
            </View>
            {footer}
          </View>
        ) : null}
        {loading && <Loader />}
      </>
    )
  }

  dismiss() {
    const { navigation } = this.props
    const beforeDismiss = navigation.getParam('beforeDismiss')

    if (beforeDismiss !== undefined) {
      beforeDismiss()
    }

    navigation.dispatch(
      StackActions.pop({
        n: 1,
      })
    )
  }
}

export default withNavigation(ModalScreen)
