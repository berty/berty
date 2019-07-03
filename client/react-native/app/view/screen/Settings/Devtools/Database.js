import { ActivityIndicator, Alert } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Menu, Screen, Text } from '@berty/component'
import { colors } from '@berty/common/constants'
import { withBridgeContext } from '@berty/bridge/Context'
import { withStoreContext } from '@berty/store/context'

@withBridgeContext
@withStoreContext
class Database extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: () =>
      navigation.getParam('dropDatabase') || (
        <Header
          navigation={navigation}
          title="Database"
          titleIcon="database"
          backBtn
        />
      ),
  })

  generateFakeData = async () => {
    try {
      await this.props.context.node.service.generateFakeData({
        t: true,
      })
    } catch (err) {
      this.setState({ err })
      console.error(err)
    }
  }

  dropDatabase = async () => {
    const { bridge } = this.props

    this.props.navigation.setParams({ dropDatabase: true })
    try {
      await bridge.daemon.dropDatabase({})
    } catch (err) {
      Alert.alert('An error occured, please, kill and restart the app')
      console.error(err)
    }
    this.props.navigation.setParams({
      dropDatabase: false,
    })
  }

  render() {
    const dropDatabase = this.props.navigation.getParam('dropDatabase')
    if (dropDatabase === true) {
      return (
        <Screen style={{ backgroundColor: colors.white }}>
          <Flex.Rows align="center">
            <Flex.Cols align="end">
              <ActivityIndicator size="large" />
            </Flex.Cols>
            <Text center margin align="start">
              Dropping database, waiting for daemon to restart ...
            </Text>
          </Flex.Rows>
        </Screen>
      )
    }
    return (
      <Menu>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            icon="database"
            title="Generate fake data"
            onPress={this.generateFakeData}
          />
          <Menu.Item
            icon="refresh-ccw"
            title="Drop database"
            onPress={this.dropDatabase}
          />
        </Menu.Section>
      </Menu>
    )
  }
}

export default Database
