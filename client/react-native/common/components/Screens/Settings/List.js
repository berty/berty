import React, { PureComponent } from 'react'
import { Image, ActivityIndicator } from 'react-native'
import { Menu, Text, Screen } from '../../Library'
import { QueryReducer } from '../../../relay'
import { colors } from '../../../constants'
import { graphql } from 'react-relay'

export default class List extends PureComponent {
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
        title={overrideDisplayName || displayName}
      />
      <Menu.Section>
        <Menu.Item
          icon='user'
          title='My account'
          onPress={() => navigation.push('settings/my-account')}
        />
      </Menu.Section>
      <Menu.Section>
        <Menu.Item
          icon='lock'
          title='Security & privacy'
          onPress={() => navigation.push('settings/security-and-privacy')}
        />
        <Menu.Item
          icon='send'
          title='Messages settings'
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
          onPress={() => navigation.push('settings/security-and-privacy')}
        />
        <Menu.Item
          icon='activity'
          title='News'
          onPress={() => navigation.push('settings/news')}
        />
      </Menu.Section>
      <Menu.Section>
        <Menu.Item
          icon='terminal'
          title='Dev tools'
          onPress={() => navigation.push('settings/devtools')}
        />
        <Menu.Item
          icon='life-buoy'
          title='Help'
          onPress={() => navigation.push('settings/help')}
        />
        <Menu.Item
          icon='layers'
          title='Legal terms'
          onPress={() => navigation.push('settings/layers')}
        />
      </Menu.Section>
    </Menu>
  )

  render () {
    const { navigation } = this.props
    return (
      <Screen>
        <QueryReducer
          query={graphql`
            query ListSettingsQuery($filter: BertyEntityContactInput) {
              ContactList(
                filter: $filter
                first: 1
                orderBy: ""
                orderDesc: false
              ) {
                edges {
                  node {
                    id
                    displayName
                    overrideDisplayName
                  }
                }
              }
            }
          `}
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
              case state.success:
                return (
                  <List.Menu
                    navigation={navigation}
                    data={state.data.ContactList.edges[0].node}
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
