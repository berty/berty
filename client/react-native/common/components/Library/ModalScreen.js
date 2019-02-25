import { StackActions, withNavigation } from 'react-navigation'
import { View } from 'react-native'
import React from 'react'

import { Loader } from './'
import Button from './Button'
import colors from '../../constants/colors'

const ModalScreen = props => {
  const {
    children,
    navigation,
    loading,
    showDismiss,
    width,
    footer,
    ...otherProps
  } = props

  const beforeDismiss = navigation.getParam('beforeDismiss')

  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      >
        <View
          style={{
            backgroundColor: colors.transparentGrey,
            flex: 1,
          }}
        />
      </View>
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
                  onPress={() => {
                    if (beforeDismiss !== undefined) {
                      beforeDismiss()
                    }

                    navigation.dispatch(
                      StackActions.pop({
                        n: 1,
                      })
                    )
                  }}
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

export default withNavigation(ModalScreen)
