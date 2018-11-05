import React, { PureComponent } from 'react'
import { Menu, Header } from '../../../Library'
import { mutations } from '../../../../graphql'

export default class Database extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Peers List'
//        titleIcon='Peers'
        backBtn
      />
    ),
  })
  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='database'
            title=''
            onPress={async () => {
              try {
                await mutations.generateFakeData.commit({ t: true })
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
