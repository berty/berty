import { ScrollView, TextInput, Platform, Clipboard, TouchableNativeFeedback, TouchableOpacity } from 'react-native'
import { btoa } from 'b64-lite'
import React, { PureComponent } from 'react'

import { Button, Flex, TextInputMultilineFix, Text } from './index'
import { RelayContext } from '../../relay'
import { colors } from '../../constants'
import {
  extractPublicKeyFromId, makeShareableUrl,
  shareLinkOther,
  shareLinkSelf,
} from '../../helpers/contacts'
import { marginTop, padding, rounded, textTiny } from '../../styles'
import QRGenerator from './QRGenerator'
import { ThemeProvider, ButtonGroup } from 'react-native-elements'
import { parse as parseUrl } from '../../helpers/url'
import QRReader from './QRReader'

const CopyKeyButton = ({ id }) => (
  <ActionButton
    icon='copy'
    onPress={() => Clipboard.setString(id)}
    label={'Copy the key'}
  />
)

const ShareKeyButton = ({ id, displayName, self }) => (
  <ActionButton
    icon='share'
    onPress={() =>
      self
        ? shareLinkSelf({ id, displayName })
        : shareLinkOther({ id, displayName })
    }
    label={'Share the key'}
  />
)

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

const AddButton = ({ onPress }) => (
  <ActionButton icon='plus' onPress={onPress} label={'Add this key'} />
)

export default class PublicKeyWithActions extends PureComponent {
  static contextType = RelayContext

  constructor (props) {
    super(props)
    const [initialKey, initialName] = props.navigation
      ? [
        props.navigation.getParam('initialKey'),
        props.navigation.getParam('initialName'),
      ]
      : [props.initialKey, props.initialName]
    const missingInitialData = props.initialKey === undefined
    this.state = {
      err: null,
      contact: {
        id: initialKey || '',
        displayName: initialName || '',
        displayStatus: '',
        overrideDisplayName: '',
        overrideDisplayStatus: '',
      },
      mode: props.mode || 'key',
    }

    if (missingInitialData && props.data !== undefined) {
      try {
        this.state.contact = {
          ...props.data,
          id: extractPublicKeyFromId(props.data.id),
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  onSubmit = async () => {
    const input = {
      contact: {
        ...this.state.contact,
        id: btoa(`contact:${this.state.contact.id}`),
        displayName: this.state.contact.displayName,
      },
      introText: '',
    }
    try {
      await this.props.screenProps.context.mutations.contactRequest(input)
      this.props.navigation.goBack(null)
    } catch (err) {
      this.setState({ err })
    }
  }

  render () {
    const {
      navigation,
      shareButton,
      addButton,
      copyButton,
      readOnly,
      self,
    } = this.props
    const {
      contact: { id, displayName },
      mode,
    } = this.state

    let errors = []
    try {
      errors = this.state.err.res.errors
    } catch (e) {
      // noop
    }

    const modeButtons = [
      { element: () => <Text icon={'edit'} big color={mode === 'key' ? colors.white : colors.grey1} /> },
      {
        element: () => <Text icon={'material-qrcode-scan'} big
          color={mode === 'qrcode' ? colors.white : colors.grey1} />,
      },
    ]

    return (
      <ScrollView>
        <Flex.Rows style={[padding]} align='center'>
          <Flex.Cols style={{ width: 330 }}>
            {mode === 'key' || (readOnly)
              ? <TextInput
                placeholder={'Contact name (optional)'}
                onChangeText={displayName =>
                  this.setState({ contact: { ...this.state.contact, displayName } })
                }
                value={displayName}
                style={[
                  {
                    backgroundColor: colors.grey7,
                    color: colors.black,
                    textAlign: 'left',
                    flex: 1,
                    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
                  },
                  padding,
                  rounded,
                ]}
              />
              : <Text style={{ flex: 1 }}>{' '}</Text>
            }
            {/* TODO: Use a lighter button group impl? */}
            <ThemeProvider theme={{ colors: { primary: colors.blue } }}>
              <ButtonGroup
                onPress={() => this.setState({ mode: mode === 'key' ? 'qrcode' : 'key' })}
                selectedIndex={mode === 'key' ? 0 : 1}
                buttons={modeButtons}
                containerStyle={{ height: 32, flex: 1 }}
                selectedBackgroundColor={colors.green}
                component={Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity}
              />
            </ThemeProvider>
          </Flex.Cols>
          {mode === 'key'
            ? <TextInputMultilineFix
              style={[
                {
                  width: 330,
                  height: 248,
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
              value={id}
              onChangeText={id =>
                this.setState({ contact: { ...this.state.contact, id } })
              }
              editable={!readOnly}
              selectTextOnFocus
            />
            : null}

          {!readOnly && mode === 'qrcode'
            ? <QRReader style={{ width: 248, height: 248 }} onFound={data => {
              const url = parseUrl(data)

              if (!url || url.pathname !== '/add-contact' || url.hashParts['public-key'] === '') {
                return
              }

              this.setState({
                mode: 'key',
                contact: {
                  ...this.state.contact,
                  id: url.hashParts['public-key'],
                  displayName: url.hashParts['display-name'] || '',
                },
              })
            }} /> : null}
          {readOnly && mode === 'qrcode'
            ? <QRGenerator
              value={makeShareableUrl({ id, displayName })}
              size={248}
              style={[marginTop]} />
            : null // TODO: implement camera
          }

          {shareButton ? (
            <ShareKeyButton id={id} displayName={displayName} self={self} />
          ) : null}
          {copyButton ? <CopyKeyButton id={id} /> : null}
          {addButton && mode === 'key' ? (
            <AddButton
              id={id}
              displayName={displayName}
              navigation={navigation}
              onPress={this.onSubmit}
            />
          ) : null}
          {errors.map((err, i) => <Text multiline key={i}>{err.extensions.message}</Text>)}
        </Flex.Rows>
      </ScrollView>
    )
  }
}
