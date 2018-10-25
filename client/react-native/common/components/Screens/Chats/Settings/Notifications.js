import React, { PureComponent } from 'react'
import { Switch, Text } from 'react-native'
import { Header, Menu } from '../../../Library'
import { colors } from '../../../../constants'

export default class Notifications extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Notifications' backBtn />,
  })

  state = {
    mute: false,
    override: true,
    alert: true,
    preview: false,
  }

  render () {
    return (
      <Menu>
        <Menu.Section>
          <Menu.Item
            icon='bell-off'
            title='Mute this conversation'
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.mute}
                onValueChange={value => {
                  this.setState({ mute: value })
                  console.log('Mute:', value)
                }}
              />
            }
          />
        </Menu.Section>
        <Text
          align='center'
          style={{
            color: colors.textGrey,
            marginTop: 32,
          }}
        >
          You can set custom notifications for this group
        </Text>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            icon='bell'
            title='Override app notifications'
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.override}
                onValueChange={value => this.setState({ override: value })}
              />
            }
          />
        </Menu.Section>
        {this.state.override && (
          <Menu.Section>
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
        )}
      </Menu>
    )
  }
}
