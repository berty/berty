import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, Image } from 'react-native'
import { Screen, Flex, Text, Separator } from '../../Library'
import { colors } from '../../../constants'
import {
  paddingLeft,
  paddingRight,
  padding,
  borderBottom,
} from '../../../styles'
import { fetchQuery } from 'react-relay'
import { environment } from '../../../relay'
import { queries } from '../../../graphql'

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
      { backgroundColor: colors.white, height: 56 },
      borderBottom,
      padding,
    ]}
  >
    <Flex.Cols size={1} align='start' space='between'>
      <Text icon='message-circle' large color={colors.black}>
        Chats
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
    <Flex.Cols align='left'>
      <Flex.Rows size={1} align='left' style={{marginLeft: 30}}>
        <Image
          style={{width: 40, height: 40, borderRadius: 50}}
          source={{uri: 'https://api.adorable.io/avatars/285/' + title + '.png'}}
        />
      </Flex.Rows>
      <Flex.Rows size={6} align='left' style={{marginLeft: 14}}>
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

  state = {
    refreshing: false,
    conversations: null,
    err: null,
  }

  async componentDidMount () {
    if (this.state.conversations == null) {
      await this.getConversations()
    }
  }

  getConversations = async () => {
    try {
      const { ConversationList } = await fetchQuery(
        environment,
        queries.ConversationList
      )
      this.setState({
        refreshing: false,
        conversations: ConversationList,
        err: null,
      })
    } catch (err) {
      this.setState({ refreshing: false, conversations: null, err: err })
      console.error(err)
    }
  }

  render () {
    const { navigation } = this.props
    const { refreshing, conversations } = this.state
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <FlatList
          data={[...(conversations || []), ...genChats()]}
          style={[paddingLeft, paddingRight]}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          refreshing={refreshing}
          onRefresh={this.getConversations}
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
