import React, { PureComponent } from 'react'
import { Menu } from '../../../Library'

export default class List extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='refresh-ccw'
            title='Restart daemon (not implemented)'
            onPress={() => {
              console.log('Restart')
            }}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='database'
            title='Database'
            onPress={() => navigation.push('devtools/database')}
          />
          <Menu.Item
            icon='activity'
            title='Network'
            onPress={() => navigation.push('devtools/network')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
