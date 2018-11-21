import { ActivityIndicator, Platform, Share, TextInput } from 'react-native'
import { btoa, atob } from 'b64-lite'
import React, { PureComponent } from 'react'

import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

import { QueryReducer } from '../../../../relay'
import {
  Screen,
  Text,
  ModalScreen,
  PublicKeyWithActions,
  Button,
  Flex,
  TextInputMultilineFix,
} from '../../../Library'
import {
  borderBottom,
  marginTop,
  padding,
  paddingVertical,
  rounded,
  textTiny,
} from '../../../../styles'
import { colors } from '../../../../constants'
import { fragments, mutations, queries } from '../../../../graphql'

const requestContact = async (
  { id, displayName },
  navigation,
  errorHandler
) => {
  try {
    await mutations.contactRequest.commit({
      contact: {
        id: btoa(`contact:${id}`),
        displayName: displayName || '',
        displayStatus: '',
        overrideDisplayName: '',
        overrideDisplayStatus: '',
      },
      introText: '',
    })
    navigation.goBack(null)
  } catch (err) {
    errorHandler(err)
  }
}

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

const AddButton = ({ id, displayName, navigation, errorHandler }) => (
  <ActionButton
    icon='plus'
    onPress={() =>
      requestContact({ id, displayName }, navigation, errorHandler)
    }
    label={'Add this key'}
  />
)

const ShareMyKey = ({ contactId, displayName }) => (
  <ActionButton
    icon='plus'
    onPress={() => {
      const url = `https://berty.tech/add-contact#public-key=${encodeURIComponent(
        contactId
      )}&display-name=${encodeURIComponent(displayName)}`
      Share.share({
        title: 'Add me on Berty',
        message: `Use this link to add me on Berty ${url}`,
        url: url,
      }).catch(() => null)
    }}
    label={'Share my key'}
  />
)

class ByPublicKeyComponent extends PureComponent {
  state = {
    contactId: '',
    displayName: '',
  }

  constructor (props) {
    super(props)

    const initialData =
      props.initialKey !== undefined && props.initialName !== undefined

    if (props.initialKey !== undefined) {
      this.state.contactId = props.initialKey
    }

    if (props.initialName !== undefined) {
      this.state.displayName = props.initialName
    }

    if (!initialData && props.data !== undefined) {
      try {
        this.state.contactId = atob(props.data.id).split('contact:')[1]
      } catch (e) {
        console.error(e)
      }

      this.state.displayName = props.data.displayName
    }
  }

  render () {
    const { navigation, shareButton, addButton, readOnly } = this.props
    const { contactId, displayName } = this.state

    return (
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
              height: 330,
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
          value={contactId || this.props.navigation.getParam('initialKey')}
          onChangeText={contactId => this.setState({ contactId })}
          editable={!readOnly}
          selectTextOnFocus
        />

        <Flex.Cols justify='center'>
          {shareButton ? (
            <ShareMyKey contactId={contactId} displayName={displayName} />
          ) : null}
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
        </Flex.Cols>
      </Flex.Rows>
    )
  }
}

const ByPublicKey = fragments.Contact(ByPublicKeyComponent)

const AddByPublicKeyScreen = props => (
  <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
    <PublicKeyWithActions
      navigation={props.navigation}
      initialKey={''}
      addButton
    />
  </Screen>
)

class SharePublicKeyScreen extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <QueryReducer
          query={queries.Contact}
          variables={{
            filter: {
              id: '',
              status: 42,
              displayName: '',
              displayStatus: '',
              overrideDisplayName: '',
              overrideDisplayStatus: '',
            },
          }}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator />
              case state.success: {
                return (
                  <ByPublicKey
                    navigation={navigation}
                    readOnly
                    shareButton
                    copyButton
                    self
                    data={state.data.ContactList.edges[0].node}
                  />
                )
              }
              case state.error:
                return (
                  <Text
                    background={colors.error}
                    color={colors.white}
                    medium
                    middle
                    center
                    self='center'
                  >
                    An unexpected error occurred, please restart the application
                  </Text>
                )
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    'Enter a public key': AddByPublicKeyScreen,
    'View my public key': SharePublicKeyScreen,
  },
  {
    initialRouteName: 'Enter a public key',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'top',

    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.black,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  }
)

export const ByPublicKeyModal = props => (
  <ModalScreen navigation={props.navigation}>
    <PublicKeyWithActions
      addButton
      initialKey={props.navigation.getParam('initialKey', '')}
      initialName={props.navigation.getParam('initialName', '')}
      {...props}
    />
  </ModalScreen>
)
