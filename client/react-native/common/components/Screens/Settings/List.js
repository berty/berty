import { Image, ActivityIndicator, Linking } from 'react-native'
import React, { PureComponent } from 'react'

import { Menu, Text, Screen } from '../../Library'
import { QueryReducer } from '../../../relay'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'
import { merge } from '../../../helpers'

export default class List extends PureComponent {
  static Menu = fragments.Contact(
    ({
      navigation,
      data: { id, displayName, overrideDisplayName },
      availableUpdate,
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
          title={overrideDisplayName || displayName}
        />
        <Menu.Section>
          <Menu.Item
            icon='user'
            title='My account'
            onPress={() => navigation.push('settings/my-account')}
          />
          {availableUpdate ? (
            <Menu.Item
              icon='arrow-up-circle'
              title='An update of the app is available'
              onPress={() =>
                Linking.openURL(availableUpdate['manifest-url']).catch(e =>
                  console.error(e)
                )
              }
              color={colors.red}
            />
          ) : null}
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='terminal'
            title='Dev tools'
            onPress={() => navigation.push('settings/devtools')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='lock'
            title='Security & privacy (not implem.)'
            onPress={() => navigation.push('settings/security-and-privacy')}
          />
          <Menu.Item
            icon='send'
            title='Messages settings (not implem.)'
            onPress={() => navigation.push('settings/messages-settings')}
          />
          <Menu.Item
            icon='bell'
            title='Notifications'
            onPress={() => navigation.push('settings/notifications')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='info'
            title='About berty'
            onPress={() => navigation.push('settings/about')}
          />
          <Menu.Item
            icon='activity'
            title='News (not implem.)'
            onPress={() => navigation.push('settings/news')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='life-buoy'
            title='Help'
            onPress={() => navigation.push('settings/help')}
          />
          <Menu.Item
            icon='layers'
            title='Legal terms'
            onPress={() => navigation.push('settings/legal')}
          />
        </Menu.Section>
      </Menu>
    )
  )

  render () {
    const {
      navigation,
      screenProps: {
        context: { queries },
      },
    } = this.props

    return (
      <Screen>
        <QueryReducer
          query={queries.Contact.graphql}
          variables={merge([
            queries.Contact.defaultVariables,
            {
              filter: {
                status: 42,
              },
            },
          ])}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator />
              case state.success:
                return (
                  <List.Menu
                    navigation={navigation}
                    data={state.data.Contact}
                    availableUpdate={this.props.screenProps.availableUpdate}
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
