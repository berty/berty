import React, { PureComponent } from 'react'
import { Image, ActivityIndicator } from 'react-native'
import { Screen, Menu, Header, Text } from '../../Library'
import { colors } from '../../../constants'
import { queries } from '../../../graphql'
import { QueryReducer } from '../../../relay'

export default class MyAccount extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const onSave = navigation.getParam('onSave')
    return {
      tabBarVisible: false,
      header: (
        <Header
          navigation={navigation}
          title='My account'
          rightBtnIcon={'save'}
          backBtn
          onPressRightBtn={onSave}
        />
      ),
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onSave: this.onSave,
    })
  }

  onSave = () => {
    this.setState({ edit: false }, () =>
      this.props.navigation.setParams({ state: this.state })
    )
  }

  static Menu = ({
    navigation,
    data: { id, displayName, overrideDisplayName },
  }) => (
    <Menu absolute>
      <Menu.Header
        icon={
          <Image
            style={{ width: 78, height: 78, borderRadius: 39 }}
            source={{
              uri: 'https://api.adorable.io/avatars/285/' + id + '.png',
            }}
          />
        }
      />
      <Menu.Section title='Firstname'>
        <Menu.Input
          value={(overrideDisplayName || displayName).split(' ')[0] || ''}
        />
      </Menu.Section>
      <Menu.Section title='Lastname'>
        <Menu.Input
          value={(overrideDisplayName || displayName).split(' ')[1] || ''}
        />
      </Menu.Section>
      <Menu.Section>
        <Menu.Item
          icon='awesome-qrcode'
          title='View QR code'
          onPress={() => navigation.push('settings/my-account/view-qr-code')}
        />
        <Menu.Item
          icon='eye'
          title='View public key'
          onPress={() => navigation.push('settings/my-account/view-public-key')}
        />
      </Menu.Section>
      <Menu.Section>
        <Menu.Item
          icon='trash-2'
          title='Delete my account'
          color={colors.error}
          onPress={() => console.error('delete my account: not implemented')}
        />
      </Menu.Section>
    </Menu>
  )

  render () {
    return (
      <Screen>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator />
              case state.success:
                return (
                  <MyAccount.Menu
                    data={state.data.ContactList.find(
                      _ => _.status === 'Myself'
                    )}
                  />
                )
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
                    An unexpected error occured, please restart the application
                  </Text>
                )
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}
