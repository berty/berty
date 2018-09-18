import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Flex } from '../../../Library'
import { colors } from '../../../../constants'
import { padding, borderTop } from '../../../../styles'

export default class Choice extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Flex.Cols
        size={1}
        style={[{ backgroundColor: colors.white }, borderTop]}
      >
        <Flex.Rows size={1} align='center' style={[padding]}>
          <Item
            icon='user-plus'
            name='Pending requests'
            link='Request'
            navigation={navigation}
          />
          <Item
            icon='square'
            name='QR Code'
            link='ByQRCode'
            navigation={navigation}
          />
          <Item
            icon='edit-2'
            name='Public key'
            link='ByPublicKey'
            navigation={navigation}
          />
          <Item
            icon='smartphone'
            name='Bump'
            link='ByBump'
            navigation={navigation}
          />
          <Item
            icon='mail'
            name='Invite a friend'
            link='Invite'
            navigation={navigation}
          />
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}

const Item = ({ icon, name, link, navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.push(link)}
    style={[
      {
        borderRadius: 8,
        height: 60,
        width: 300,
        backgroundColor: colors.blue,
        paddingLeft: 24,
        paddingRight: 8,
        margin: 10,
      },
    ]}
  >
    <Flex.Cols size={1} align='center' space='between'>
      <Text icon={icon} large color={colors.white}>
        {name}
      </Text>
      <Text icon='chevron-right' large color={colors.white} />
    </Flex.Cols>
  </TouchableOpacity>
)
