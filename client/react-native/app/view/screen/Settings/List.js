import { ActivityIndicator } from 'react-native'
import React, { PureComponent } from 'react'

import { Menu, Text, Screen, Avatar, Header } from '@berty/component'
import { QueryReducer } from '@berty/relay'
import { colors } from '@berty/common/constants'
import { fragments } from '@berty/graphql'
import { merge } from '@berty/common/helpers'
import { UpdateContext, installUpdate } from '@berty/update'
import { withRelayContext } from '@berty/relay/context'
import { withNamespaces } from 'react-i18next'
import { contact } from '@berty/relay/utils'
import I18n from 'i18next'

class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('settings.title')}
        titleIcon='settings'
      />
    ),
    tabBarVisible: true,
  })

  static Menu = fragments.Contact(
    ({ navigation, data, availableUpdate, t }) => {
      const { id, displayName, overrideDisplayName } = data

      return (
        <Menu absolute>
          <Menu.Header
            icon={<Avatar data={{ id }} size={78} />}
            title={overrideDisplayName || displayName}
          />
          <Menu.Section>
            <Menu.Item
              icon='user'
              title={t('settings.my-account')}
              onPress={() => navigation.navigate('settings/my-account', {})}
            />
            <Menu.Item
              icon='share'
              title={t('settings.my-account-share')}
              onPress={() =>
                navigation.navigate('modal/contacts/card', {
                  ...data,
                  id: contact.getCoreID(id),
                  self: true,
                })
              }
            />
            {availableUpdate ? (
              <Menu.Item
                icon='arrow-up-circle'
                title={t('settings.update-available')}
                onPress={() => installUpdate(availableUpdate)}
                color={colors.red}
              />
            ) : null}
            <Menu.Item
              icon='arrow-up-circle'
              title={t('settings.updates-check')}
              onPress={() => navigation.navigate('settings/update')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='terminal'
              title={t('settings.dev-tools')}
              onPress={() => navigation.navigate('settings/devtools')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='lock'
              title={t('settings.security-privacy')}
              onPress={() =>
                navigation.navigate('settings/security-and-privacy')
              }
            />
            <Menu.Item
              icon='send'
              title={t('settings.messages')}
              onPress={() => navigation.navigate('settings/messages-settings')}
            />
            <Menu.Item
              icon='bell'
              title={t('settings.notifications')}
              onPress={() => navigation.navigate('settings/notifications')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='info'
              title={t('settings.about')}
              onPress={() => navigation.navigate('settings/about')}
            />
            <Menu.Item
              icon='activity'
              title={t('settings.news')}
              onPress={() => navigation.navigate('settings/news')}
            />
          </Menu.Section>
          <Menu.Section>
            <Menu.Item
              icon='life-buoy'
              title={t('settings.help')}
              onPress={() => navigation.navigate('settings/help')}
            />
            <Menu.Item
              icon='layers'
              title={t('settings.legal')}
              onPress={() => navigation.navigate('settings/legal')}
            />
          </Menu.Section>
        </Menu>
      )
    }
  )

  render () {
    const {
      navigation,
      context: { queries },
      t,
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
                  <UpdateContext.Consumer>
                    {({ availableUpdate }) => (
                      <List.Menu
                        navigation={navigation}
                        data={state.data.Contact}
                        availableUpdate={availableUpdate}
                        t={t}
                      />
                    )}
                  </UpdateContext.Consumer>
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

export default withRelayContext(withNamespaces()(List))
