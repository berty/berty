import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Flex } from '../../../Library'
import { colors } from '../../../../constants'
import {
  padding,
  borderTop,
} from '../../../../styles'

export default class Choice extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Flex.Cols
        size={1}
        style={[
          { backgroundColor: colors.white },
          borderTop,
        ]}
      >
        <Flex.Rows
          size={1}
          align='center' space='evenly'
          style={[
            padding,
          ]}
        >
          <Item
            color={colors.blue}
            name='Bump'
            link='ByBump'
            navigation={navigation}
          />
          <Item
            color={colors.red}
            name='Scan a QR Code'
            link='ByQRCode'
            navigation={navigation}
          />
          <Item
            color={colors.orange}
            name='Enter a public key'
            link='ByPublicKey'
            navigation={navigation}
          />
          <Item
            color={colors.yellow}
            name='Pending contact requests'
            link='Request'
            navigation={navigation}
          />
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}

const Item = ({
  color,
  name,
  link,
  navigation,
}) => (
  <TouchableOpacity
    onPress={() => navigation.push(link)}
    style={[{
      borderRadius: 8,
      height: 100,
      width: 300,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }]}
  >
    <Text
      style={[{
        fontSize: 30,
        color: colors.white,
      }]}
    >
      { name }
    </Text>
  </TouchableOpacity>
)
