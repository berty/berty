import React, { PureComponent } from 'react'
import { Menu } from '../../../Library'

export default class Network extends PureComponent {
  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='list'
            title='List peers (not implemented)'
            onPress={() => {
              console.log('List')
            }}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
