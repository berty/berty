import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'
import Request from './Request'
import RequestValidation from './RequestValidation'

import React from 'react'
import { View } from 'react-native'
import { Text, Button, Flex } from '../../../Library'
import { padding } from '../../../../styles'
import { colors } from '../../../../constants'

const Header = ({ navigation }) => (
  <View style={[{ backgroundColor: colors.white, height: 56 }, padding]}>
    <Flex.Rows>
      <Flex.Cols self='left' style={{ position: 'absolute' }}>
        <Button
          padding
          large
          left
          color='black'
          icon='arrow-left'
          onPress={() => navigation.goBack(null)}
        />
      </Flex.Cols>
      <Flex.Cols size={1} self='center' style={{ position: 'absolute' }}>
        <Text icon='user-plus' color='black' padding medium>
          Add a contact
        </Text>
      </Flex.Cols>
    </Flex.Rows>
  </View>
)

export default createSubStackNavigator(
  {
    ByBump,
    ByPublicKey,
    ByQRCode,
    Request,
    RequestValidation,
    Choice,
  },
  {
    initialRouteName: 'Choice',
    navigationOptions: ({ navigation }) => ({
      header: <Header navigation={navigation} />,
    }),
  }
)
