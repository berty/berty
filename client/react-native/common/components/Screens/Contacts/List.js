import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, TextInput, Image } from 'react-native'
import { Screen, Flex, Text, Separator, Button } from '../../Library'
import { colors } from '../../../constants'
import {
  paddingLeft,
  paddingRight,
  padding,
  marginTop,
  borderBottom,
} from '../../../styles'
import { fetchQuery } from 'react-relay'
import { environment } from '../../../relay'
import { queries } from '../../../graphql'

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

const Header = ({ navigation }) => (
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
      <Button
        icon='plus'
        height={30}
        width={65}
        onPress={() => navigation.push('Add')}
      >
        Add
      </Button>
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
)

const Item = ({
  data: { id, displayName, overrideDisplayName },
  navigation,
}) => (
  <TouchableOpacity
    onPress={() => navigation.push('Detail', { id })}
    style={{
      backgroundColor: colors.white,
      paddingVertical: 16,
      height: 71,
    }}
  >
    <Flex.Cols align='left'>
      <Flex.Rows size={1} align='left' style={{marginLeft: 21}}>
        <Image
          style={{width: 50, height: 50, borderRadius: 50}}
          source={{uri: 'https://api.adorable.io/avatars/285/' + (overrideDisplayName || displayName) + '.png'}}
        />
      </Flex.Rows>
      <Flex.Rows size={6} align='left' style={{marginLeft: 42}}>
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
    header: <Header navigation={navigation} />,
    tabBarVisible: true,
  })

  state = {
    refreshing: false,
    contacts: null,
    err: null,
  }

  async componentDidMount () {
    if (this.state.contacts === null) {
      await this.getContacts()
    }
  }

  getContacts = async () => {
    try {
      const { ContactList } = await fetchQuery(environment, queries.ContactList)
      this.setState({ refreshing: false, contacts: ContactList, err: null })
    } catch (err) {
      this.setState({ refreshing: false, contacts: null, err: err })
      console.error(err)
    }
  }

  render () {
    const { navigation } = this.props
    const { refreshing, contacts } = this.state
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <FlatList
          data={[...(contacts || []), ...genContacts()]}
          style={[paddingLeft, paddingRight]}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          refreshing={refreshing}
          onRefresh={this.getContacts}
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
