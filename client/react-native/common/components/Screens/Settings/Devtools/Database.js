import React, { PureComponent } from 'react'
import { Menu } from '../../../Library'
import { mutations } from '../../../../graphql'

export default class Database extends PureComponent {
  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='database'
            title='Generate fake data'
            onPress={async () => {
              try {
                await mutations.generateFakeData.commit({})
              } catch (err) {
                this.setState({ err })
                console.error(err)
              }
            }}
          />
          <Menu.Item
            icon='refresh-ccw'
            title='Reset database (not implemented)'
            onPress={() => {
              console.log('Reset')
            }}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
