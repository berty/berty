import React, { PureComponent } from 'react'
import { TextInput } from 'react-native'
import { Flex, Screen, Text, Button } from '../../../../Library'
import { colors } from '../../../../../constants'
import {
  padding,
  paddingVertical,
  marginTop,
  marginBottom,
  rounded,
  textTiny,
} from '../../../../../styles'
import { commit } from '../../../../../relay'
import { mutations } from '../../../../../graphql'

export default class FromContact extends PureComponent {
  state = {
    contactID: '',
  }

  render () {
    const { navigation } = this.props
    const { contactID } = this.state
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
            value={contactID}
            onChangeText={contactID => this.setState({ contactID })}
          />
          <Button
            icon='plus'
            background='blue'
            margin
            padding
            rounded={23}
            height={24}
            medium
            middle
            onPress={async () => {
              try {
                await commit(mutations.ContactRequest, { contactID })
                navigation.goBack(null)
              } catch (err) {
                this.setState({ err })
                console.error(err)
              }
            }}
          >
            ADD THIS KEY
          </Button>
        </Flex.Rows>
      </Screen>
    )
  }
}
