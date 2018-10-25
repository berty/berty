import React, { PureComponent } from 'react'
import { Switch } from 'react-native'
import { Header, Menu } from '../../Library'

export default class Notifications extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Notifications' backBtn />,
  })

  state = {
    alert: true,
    preview: false,
  }

  render () {
    return (
      <Menu>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            title='Alert'
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.alert}
                onValueChange={value => {
                  this.setState({ alert: value })
                  console.log('Alert:', value)
                }}
              />
            }
          />
          <Menu.Item
            title='Message preview'
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.preview}
                onValueChange={value => {
                  this.setState({ preview: value })
                  console.log('Preview:', value)
                }}
              />
            }
          />
          <Menu.Item title='Sound' textRight='Paulette' boldLeft />
        </Menu.Section>
      </Menu>
    )
  }
}
