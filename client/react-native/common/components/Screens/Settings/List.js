import React, { PureComponent } from 'react'
import { Menu } from '../../Library'

export default class List extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='user'
            title='My account'
            onPress={() => console.log('Account')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='lock'
            title='Security & Privacy'
            onPress={() => console.log('Security')}
          />
          <Menu.Item
            icon='send'
            title='Message settings'
            onPress={() => console.log('Message')}
          />
          <Menu.Item
            icon='bell'
            title='Notifications'
            onPress={() => console.log('Notifications')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='info'
            title='About Berty'
            onPress={() => console.log('About')}
          />
          <Menu.Item
            icon='activity'
            title='News'
            onPress={() => console.log('News')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='terminal'
            title='Dev tools'
            onPress={() => navigation.push('Devtools')}
          />
          <Menu.Item
            icon='life-buoy'
            title='Support'
            onPress={() => console.log('Support')}
          />
          <Menu.Item
            icon='layers'
            title='Legal mentions'
            onPress={() => console.log('Legal')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
