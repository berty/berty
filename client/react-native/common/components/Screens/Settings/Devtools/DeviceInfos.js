import React, { PureComponent } from 'react'
import { Text, ScrollView, TouchableOpacity, Clipboard } from 'react-native'
import { Header } from '../../../Library'
import { colors } from '../../../../constants'
import { padding } from '../../../../styles'
import { GetDeviceInfos } from '../../../../graphql/queries'

export default class DeviceInfos extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Device infos'
        titleIcon='info'
        backBtn
      />
    ),
  })

  state = {
    infos: {},
  }

  componentDidMount () {
    GetDeviceInfos.then(data => {
      this.setState({ infos: data.DeviceInfos.infos })
    })
  }

  render () {
    const { infos } = this.state

    var fields = []
    for (let i = 0; i < infos.length; i++) {
      fields.push(
        <TouchableOpacity
          key={i}
          style={[
            {
              backgroundColor: colors.white,
              borderBottomColor: '#bbb',
              borderBottomWidth: 1,
            },
            padding,
          ]}
          onPress={() => Clipboard.setString(infos[i].value)}
        >
          <Text
            color={colors.black}
            style={{
              fontWeight: 'bold',
              marginBottom: 4,
            }}
          >
            {infos[i].key}
          </Text>
          <Text color={colors.black}>{infos[i].value}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <ScrollView style={{ backgroundColor: colors.background }}>
        {fields}
      </ScrollView>
    )
  }
}
