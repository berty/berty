import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { Screen, Flex, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import {
  marginLeft,
  paddingLeft,
  paddingRight,
  padding,
  borderBottom,
} from '../../../styles'

const genChats = (
  title = [
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
  title.map((t, k) => ({
    id: k.toString(),
    title: t,
  }))

const Header = ({ navigation }) => (
  <Flex.Rows
    size={1}
    style={[
      { backgroundColor: colors.white, height: 72 },
      borderBottom,
      padding,
    ]}
  >
    <Flex.Cols size={1} align='start' space='between'>
      <Text icon='feather-users' large color={colors.black}>
        Contacts
      </Text>
    </Flex.Cols>
  </Flex.Rows>
)
const Item = ({ data: { id, title }, navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.push('Detail', { id })}
    style={{
      backgroundColor: colors.white,
      paddingVertical: 16,
      height: 71,
    }}
  >
    <Flex.Cols align='left' style={{ marginLeft }}>
      <Flex.Rows size={1} align='left'>
        <Text color={colors.black} left middle>
          {title}
        </Text>
        <Text color={colors.subtleGrey} tiny>
          Last message sent 3 hours ago ...
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
)

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} />,
    tabBarVisible: true,
  })
  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <FlatList
          data={genChats()}
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
