import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, TextInput } from 'react-native'
import { Screen, Flex, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import {
  marginLeft,
  paddingLeft,
  paddingRight,
  padding,
  marginTop,
  borderBottom,
} from '../../../styles'

const genContacts = (
  displayNames = [
    'Myla Maldonado',
    'Graeme Kenny',
    'Sienna-Rose Carter',
    'Marcos Odonnell',
    'Arnold Puckett',
    'Chay Blake',
    'Katarina Rosario',
    'Amy-Louise Chaney',
    'Janet Steele',
    'Rodney Ayala',
  ]
) =>
  displayNames.map((dn, k) => ({
    id: k.toString(),
    displayName: dn,
  }))

const Item = ({
  data: { id, displayName, overrideDisplayName },
  navigation,
}) => (
  <TouchableOpacity
    onPress={() => {
      navigation.push('Detail', { id })
    }}
    style={{
      backgroundColor: colors.white,
      paddingVertical: 16,
      height: 71,
    }}
  >
    <Flex.Cols align='left' style={{ marginLeft }}>
      <Flex.Rows size={1} align='left'>
        <Text color={colors.black} left middle>
          {overrideDisplayName || displayName}
        </Text>
        <Text color={colors.subtleGrey} tiny>
          Last seen 3 hours ago ...
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
)

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Flex.Rows
        size={1}
        style={[
          { backgroundColor: colors.white, height: 100 },
          borderBottom,
          padding,
        ]}
      >
        <Flex.Cols size={1} align='center' space='between'>
          <Text icon='feather-users' large color={colors.black}>
            Contacts
          </Text>
          <Text icon='plus' background={colors.black} rounded='circle'>
            Add
          </Text>
        </Flex.Cols>
        <TextInput
          style={[
            {
              height: 36,
              backgroundColor: colors.grey7,
              borderWidth: 0,
              borderRadius: 18,
            },
            marginTop,
            paddingLeft,
            paddingRight,
          ]}
          placeholder='Search'
        />
      </Flex.Rows>
    ),
  })
  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <FlatList
          data={genContacts()}
          style={[paddingLeft, paddingRight]}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          renderItem={data => (
            <Item
              key={data.id}
              data={data.item}
              separators={data.separators}
              navigation={navigation}
            />
          )}
        />
      </Screen>
    )
  }
}
