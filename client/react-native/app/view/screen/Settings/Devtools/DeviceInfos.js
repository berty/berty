import {
  Clipboard,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native'
import React, { PureComponent } from 'react'

import { Header } from '@berty/component'
import { colors } from '@berty/common/constants'
import { padding } from '@berty/common/styles'
import { withStoreContext } from '@berty/store/context'

@withStoreContext
class DeviceInfos extends PureComponent {
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
    const { context } = this.props
    this.setState({ refreshing: true }, async () => {
      const data = await context.node.service.DeviceInfos({})
      this.setState({ infos: data.infos, refreshing: false })
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

export default DeviceInfos
