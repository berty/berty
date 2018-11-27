import {
  Clipboard,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native'
import React, { PureComponent } from 'react'

import { Header } from '../../../Library'
import { RelayContext } from '../../../../relay'
import { colors } from '../../../../constants'
import { padding } from '../../../../styles'

export default class DeviceInfos extends PureComponent {
  static contextType = RelayContext

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
    refreshing: false,
  }

  fetch = () => {
    const { queries } = this.context
    this.setState({ refreshing: true }, async () => {
      console.log(queries)
      const data = await queries.DeviceInfos.fetch()
      this.setState({ infos: data.DeviceInfos.infos, refreshing: false })
    })
  }

  componentDidMount () {
    this.fetch()
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
      <ScrollView
        style={{ backgroundColor: colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.fetch}
          />
        }
      >
        {fields}
      </ScrollView>
    )
  }
}
