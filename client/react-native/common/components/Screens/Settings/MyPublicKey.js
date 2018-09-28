import React, { PureComponent } from 'react'
import { Platform, TextInput as TextInputNative } from 'react-native'
import { colors } from '../../../constants'
import { Flex, Screen, Header } from '../../Library'
import {
  padding,
  paddingVertical,
  textTiny,
  marginTop,
  rounded,
} from '../../../styles'
import { atob } from 'b64-lite'

class TextInputMultilineFix extends PureComponent {
  state = {
    multiline: false,
  }

  render () {
    return (
      <TextInputNative
        {...this.props}
        onFocus={() => {
          Platform.OS === 'android' &&
            this.props.multiline &&
            this.setState({ multiline: true })
          return this.props.onFocus && this.props.onFocus()
        }}
        onBlur={() => {
          Platform.OS === 'android' &&
            this.props.multiline &&
            this.setState({ multiline: true })
          return this.props.onBlur && this.props.onBlur()
        }}
        multiline={
          Platform.OS === 'android'
            ? this.state.multiline
            : this.props.multiline
        }
      />
    )
  }
}

export default class MyPublicKey extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    header: <Header navigation={navigation} title='My QR code' backBtn />,
  })

  share = () => {
    const { id } = this.props.navigation.getParam('data')
    console.log('Share: ', id)
  }

  render () {
    const { id } = this.props.navigation.getParam('data')
    const myID = atob(id).split('CONTACT:')[1]
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          <TextInputMultilineFix
            style={[
              {
                width: 330,
                height: 330,
                backgroundColor: colors.grey7,
                color: colors.black,
                flexWrap: 'wrap',
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            placeholder='Type or copy/paste a berty user public key here'
            value={myID}
            selectTextOnFocus
          />
        </Flex.Rows>
      </Screen>
    )
  }
}
