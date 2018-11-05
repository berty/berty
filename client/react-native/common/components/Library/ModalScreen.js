import React from 'react'
import { View } from 'react-native'
import { StackActions } from 'react-navigation'
import colors from '../../constants/colors'
import Button from './Button'

const ModalScreen = props => {
  const {
    children,
    navigation,
    ...otherProps
  } = props

  return <View
    style={[{
      backgroundColor: colors.white,
      marginLeft: 5,
      marginRight: 5,
      marginBottom: 30,
      marginTop: 30,
      position: 'absolute',
      flex: 1,
    }]}
    {...otherProps}
  >
    <View style={{
      backgroundColor: colors.white,
      flex: 1,
    }}>
      <Button onPress={() => {
        navigation.dispatch(StackActions.pop({
          n: 1,
        }))

        if (this.props.onDismiss !== undefined) {
          this.props.onDismiss()
        }
      }}>Dismiss</Button>
    </View>
    {children}
  </View>
}

export default ModalScreen
