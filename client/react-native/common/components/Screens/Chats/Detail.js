import React, { PureComponent } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Text, Flex, Screen, Icon } from '../../Library'
import { colors } from '../../../constants'
import { mediumText, padding } from '../../../styles'

const genMessages = () => [
  {
    memberID: '0',
    text:
      'Hello !\nI have a question for you, do you know a good & secure messaging app ?',
  },
  {
    memberID: '1',
    text: "Hi, That' funny you ask, I'm actually working on a new app !",
  },
  {
    memberID: '2',
    text: 'I will let you know as soon as we have a MVP !',
  },
]

const Message = ({ text }) => (
  <Text
    left
    margin={8}
    padding={16}
    color={colors.white}
    rounded={12}
    background={colors.grey1}
  >
    {text}
  </Text>
)

const getTitle = ({ title, members } = this.props) =>
  title ||
  members.map((m, index) => {
    const displayName =
      m.contact.status === 'Myself'
        ? m.contact.status
        : m.contact.overrideDisplayName || m.contact.displayName
    const before =
      index === 0 ? '' : index === members.length - 1 ? ' and ' : ', '
    return `${before}${displayName}`
  })

export default class Detail extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <Text large>{getTitle(navigation.getParam('conversation'))}</Text>
    ),
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack(null)}>
        <Text padding large icon='arrow-left' />
      </TouchableOpacity>
    ),
  })

  state = {
    refreshing: false,
    conversation: this.props.navigation.getParam('conversation'),
    members: this.props.navigation.getParam('conversation').members,
    messages: genMessages(),
    input: '',
  }

  render () {
    const { messages } = this.state
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <Flex.Rows>
          <ScrollView style={{ paddingBottom: 60 }}>
            {messages &&
              messages.map((msg, k) => <Message key={k.toString()} {...msg} />)}
          </ScrollView>
          <Flex.Rows
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.white,
            }}
          >
            <Flex.Cols style={{ height: 60 }}>
              <Text
                left
                middle
                padding
                flex
                icon={
                  <Icon
                    name='edit-2'
                    style={[padding, mediumText, { height: 60 }]}
                  />
                }
                input={{
                  placeholder: 'Write a secure message...',
                  onChangeText: input => this.setState({ input }),
                  height: 60,
                }}
              />
            </Flex.Cols>
          </Flex.Rows>
        </Flex.Rows>
      </Screen>
    )
  }
}
