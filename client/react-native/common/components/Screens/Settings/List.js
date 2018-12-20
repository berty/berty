import { ActivityIndicator } from 'react-native'
import React, { PureComponent } from 'react'

import { Menu, Text, Screen, Avatar } from '../../Library'
import { QueryReducer } from '../../../relay'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'
import { merge } from '../../../helpers'
import { extractPublicKeyFromId } from '../../../helpers/contacts'
import { installUpdate } from '../../../helpers/update'

export default class List extends PureComponent {
  static Menu = fragments.Contact(
    ({
      navigation,
      data,
      availableUpdate,
    }) => {
      const { id, displayName, overrideDisplayName } = data

      return <Menu absolute>
        <Menu.Header
          icon={
            <Avatar data={{ id }} size={78} />
          }
          title={overrideDisplayName || displayName}
        />
        <Menu.Section>
          <Menu.Item
            icon='user'
            title='My account'
            onPress={() => navigation.push('settings/my-account', {})
            }
          />
          <Menu.Item
            icon='share'
            title='Share my account'
            onPress={() =>
              navigation.push('modal/contacts/card', {
                data: {
                  ...data,
                  id: extractPublicKeyFromId(id),
                },
                self: true,
              })
            }
          />
          {availableUpdate ? (
            <Menu.Item
              icon='arrow-up-circle'
              title='An update of the app is available'
              onPress={() => installUpdate(availableUpdate)}
              color={colors.red}
            />
          ) : null}
          <Menu.Item
            icon='arrow-up-circle'
            title='Check for updates'
            onPress={() => navigation.push('settings/update')}
          />
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
    },
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
