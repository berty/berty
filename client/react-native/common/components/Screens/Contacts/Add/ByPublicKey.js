import React, { PureComponent } from 'react'
import { TextInput } from 'react-native'
import { Flex, Screen, Text, Button } from '../../../Library'
import { colors } from '../../../../constants'
import {
  padding,
  paddingVertical,
  marginTop,
  marginBottom,
  rounded,
  textTiny,
} from '../../../../styles'

export default class ByPublicKey extends PureComponent {
  render () {
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          <Text medium color={colors.black} style={[marginBottom]}>
            Enter a public key
          </Text>
          <TextInput
            style={[
              {
                width: 330,
                height: 330,
                backgroundColor: colors.grey7,
                color: colors.black,
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            placeholder='Type or copy/paste a berty user public key here'
          />
          <Button icon='plus' style={[marginTop]}>
            ADD THIS KEY
          </Button>
        </Flex.Rows>
      </Screen>
    )
  }
}
