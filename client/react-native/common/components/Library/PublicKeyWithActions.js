import React, { PureComponent } from 'react'
import { Button, Flex, TextInputMultilineFix } from './index'
import { colors } from '../../constants'
import { ScrollView, TextInput, Platform, Clipboard } from 'react-native'
import { marginTop, padding, rounded, textTiny } from '../../styles'
import { extractPublicKeyFromId, requestContact, shareLinkOther, shareLinkSelf } from '../../helpers/contacts'

const ActionButton = props => (
  <Button
    icon={props.icon}
    background={colors.blue}
    margin
    padding
    rounded={23}
    height={24}
    medium
    middle
    center
    self='stretch'
    onPress={props.onPress}
  >
    {props.label}
  </Button>
)

const AddButton = ({ contactId, displayName, navigation, errorHandler }) => (
  <ActionButton
    icon='plus'
    onPress={() => requestContact(contactId, displayName, navigation, errorHandler)}
    label={'Add this key'}
  />
)

const CopyKeyButton = ({ contactId }) => (
  <ActionButton
    icon='copy'
    onPress={() => Clipboard.setString(contactId)}
    label={'Copy the key'}
  />
)

const ShareKeyButton = ({ contactId, displayName, self }) => (
  <ActionButton
    icon='share'
    onPress={() => self
      ? shareLinkSelf({ contactId, displayName })
      : shareLinkOther({ contactId, displayName })}
    label={'Share the key'}
  />
)

export default class PublicKeyWithActions extends PureComponent {
  state = {
    contactId: '',
    displayName: '',
  }

  constructor (props) {
    super(props)

    const initialData = props.initialKey !== undefined && props.initialName !== undefined

    if (props.initialKey !== undefined) {
      this.state.contactId = props.initialKey
    }

    if (props.initialName !== undefined) {
      this.state.displayName = props.initialName
    }

    if (!initialData && props.data !== undefined) {
      try {
        this.state.contactId = extractPublicKeyFromId(props.data.id)
      } catch (e) {
        console.error(e)
      }

      this.state.displayName = props.data.displayName
    }
  }

  render () {
    const { navigation, shareButton, addButton, copyButton, readOnly, self } = this.props
    const { contactId, displayName } = this.state

    return (
      <ScrollView>
        <Flex.Rows style={[padding]} align='center'>
          <TextInput
            placeholder={'Contact name (optional)'}
            onChangeText={displayName => this.setState({ displayName })}
            value={displayName}
            style={[
              {
                backgroundColor: colors.grey7,
                color: colors.black,
                textAlign: 'left',
                width: 330,
                flex: 0,
                ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
              },
              padding,
              rounded,
            ]}
          />
          <TextInputMultilineFix
            style={[
              {
                width: 330,
                height: 165,
                backgroundColor: colors.grey7,
                color: colors.black,
                flexWrap: 'wrap',
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            placeholder='Type or copy/paste a berty user public key here'
            value={contactId}
            onChangeText={contactId => this.setState({ contactId })}
            editable={!readOnly}
            selectTextOnFocus
          />

          {shareButton ? <ShareKeyButton contactId={contactId} displayName={displayName} self={self} /> : null}
          {copyButton ? <CopyKeyButton contactId={contactId} /> : null}
          {addButton ? (
            <AddButton
              contactId={contactId}
              displayName={displayName}
              navigation={navigation}
              errorHandler={err => {
                this.setState({ err })
                console.error(err)
              }}
            />
          ) : null}
        </Flex.Rows>
      </ScrollView>
    )
  }
}
