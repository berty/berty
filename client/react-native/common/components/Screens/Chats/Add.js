import { View } from 'react-native'
import React, { Component, PureComponent } from 'react'

import { Pagination, RelayContext } from '../../../relay'
import { Screen, Flex, Text, Header, Avatar } from '../../Library'
import { border, borderBottom, marginHorizontal } from '../../../styles'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'

const Item = fragments.Contact(
  class Item extends PureComponent {
    state = { selected: false }

    onPress = () => {
      this.setState({ selected: !this.state.selected }, this.props.onPress)
    }

    render () {
      const {
        data: { status, displayName, overrideDisplayName, displayStatus },
      } = this.props
      const { selected } = this.state

      if (status === 42) {
        return null
      }

      return (
        <Flex.Cols
          align='start'
          onPress={this.onPress}
          style={[
            {
              backgroundColor: colors.white,
              paddingVertical: 16,
              height: 71,
            },
            marginHorizontal,
            borderBottom,
          ]}
        >
          <Flex.Rows size={1} align='start'>
            <Avatar data={this.props.data} size={40} />
          </Flex.Rows>
          <Flex.Rows size={6} align='start' style={{ marginLeft: 14 }}>
            <Text color={colors.black} left middle>
              {(status === 42 && 'Myself') ||
              overrideDisplayName ||
              displayName}
            </Text>
            <Text color={colors.subtleGrey} tiny>
              {displayStatus}
            </Text>
          </Flex.Rows>
          <Flex.Rows align='end' self='center'>
            <View
              style={[
                selected ? null : border,
                {
                  height: 18,
                  width: 18,
                  backgroundColor: selected ? colors.blue : colors.white,
                  borderRadius: 9,
                },
              ]}
            >
              <Text icon='check' padding middle center color={colors.white} />
            </View>
          </Flex.Rows>
        </Flex.Cols>
      )
    }
  },
)

export default class ListScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Add members'
        titleIcon='users'
        rightBtnIcon='check-circle'
        searchBar
        backBtn
        searchHandler={navigation.getParam('searchHandler')} // Placeholder
        onPressRightBtn={navigation.getParam('onSubmit')}
      />
    ),
    tabBarVisible: true,
  })

  static contextType = RelayContext

  state = {
    contactsID: [],
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false
  }

  componentDidMount () {
    const onSubmit = this.props.navigation.getParam('onSubmit')
    if (!onSubmit) {
      this.props.navigation.setParams({
        onSubmit: this.onSubmit(this.onDefaultSubmit),
      })
    } else {
      this.props.navigation.setParams({
        onSubmit: this.onSubmit(onSubmit),
      })
    }
  }

  onDefaultSubmit = async ({ contactsID }) => {
    await this.props.screenProps.context.mutations.conversationCreate({
      title: '',
      topic: '',
      contacts: contactsID.map(id => ({
        id,
        displayName: '',
        displayStatus: '',
        overrideDisplayName: '',
        overrideDisplayStatus: '',
      })),
    })
    this.props.navigation.goBack(null)
  }

  onSubmit = onSubmit => async () => {
    try {
      await onSubmit(this.state)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { contactsID } = this.state
    const {
      screenProps: {
        context: { queries },
      },
    } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Pagination
          context={this.props.screenProps.context}
          query={queries.ContactList.graphql}
          variables={queries.ContactList.defaultVariables}
          fragment={fragments.ContactList}
          alias='ContactList'
          renderItem={props =>
            props.data.status !== 42 ? (
              <Item
                {...props}
                onPress={() => {
                  const index = contactsID.lastIndexOf(props.data.id)
                  index < 0
                    ? contactsID.push(props.data.id)
                    : contactsID.splice(index, 1)
                  this.setState({ contactsID })
                }}
              />
            ) : null
          }
        />
      </Screen>
    )
  }
}
