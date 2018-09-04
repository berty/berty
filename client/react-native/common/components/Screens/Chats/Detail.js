import React, { PureComponent } from 'react'
import { Menu } from '../../Library'
import { colors } from '../../../constants'

export default class Detail extends PureComponent {
  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='message-circle'
            title='Send a message'
            onPress={() => console.log('Send')}
          />
          <Menu.Item
            icon='phone'
            title='Call'
            onPress={() => console.log('Call')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='eye'
            title='View public key'
            onPress={() => console.log('Public')}
          />
          <Menu.Item
            icon='share'
            title='Share this contact'
            onPress={() => console.log('Share')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='slash'
            title='Block this contact'
            onPress={() => console.log('Block')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='trash-2'
            title='Delete this contact'
            color={colors.error}
            onPress={() => console.log('Delete')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
