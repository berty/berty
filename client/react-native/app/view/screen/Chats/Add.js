import { Avatar, Flex, Header, Text } from '@berty/component'
import { border, borderBottom, marginLeft, padding } from '@berty/common/styles'
import { colors } from '@berty/common/constants'
import React, { Component, PureComponent } from 'react'
import * as enums from '@berty/common/enums.gen'

import { ActivityIndicator, View } from 'react-native'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

@withNamespaces()
export class Item extends PureComponent {
  state = { selected: false }

  onPress = () => {
    this.setState({ selected: !this.state.selected }, this.props.onPress)
  }

  render () {
    const {
      data: { status, displayName, overrideDisplayName },
      t,
    } = this.props
    const { selected } = this.state

    if (status === 42) {
      return null
    }

    return (
      <Flex.Cols
        align='center'
        onPress={this.onPress}
        style={[
          {
            height: 72,
          },
          padding,
          borderBottom,
        ]}
      >
        <Flex.Cols size={1} align='center'>
          <Avatar data={this.props.data} size={40} />
          <Flex.Rows size={3} justify='start' style={[marginLeft]}>
            <Text color={colors.fakeBlack} left ellipsed>
              {overrideDisplayName || displayName}
            </Text>
            <Text color={colors.subtleGrey} left ellisped tiny>
              {t(
                `contacts.statuses.${
                  enums.ValueBertyEntityContactInputStatus[status]
                }`
              )}
            </Text>
          </Flex.Rows>
        </Flex.Cols>
        <Flex.Rows align='end' self='center'>
          <View
            style={[
              selected ? null : border,
              {
                height: 18,
                width: 18,
                backgroundColor: selected ? colors.blue : colors.background,
                borderRadius: 9,
              },
            ]}
          >
            <Text
              icon='check'
              middle
              center
              color={selected ? colors.white : colors.background}
            />
          </View>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}

@withNamespaces()
class ListScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('chats.add-members')}
        titleIcon='users'
        rightBtn={navigation.getParam('rightBtn')}
        rightBtnIcon='check-circle'
        backBtn
        onPressRightBtn={navigation.getParam('onSubmit')}
      />
    ),
    tabBarVisible: true,
  })

  setNavigationParams = (
    params = {
      onSubmit: this.onSubmit(
        this.props.navigation.getParam('onSubmit') || this.onDefaultSubmit
      ),
      rightBtn: null,
    }
  ) => this.props.navigation.setParams(params)

  state = {
    contactsID: [],
  }

  shouldComponentUpdate (nextProps, nextState) {
    return false
  }

  componentDidMount () {
    this.setNavigationParams()
  }

  onDefaultSubmit = async ({ contactsID }) => {
    const {
      ConversationCreate: conversation,
    } = await this.props.context.mutations.conversationCreate({
      title: '',
      topic: '',
      infos: '',
      kind: enums.BertyEntityConversationInputKind.Group,
      contacts: contactsID.map(id => ({
        id,
        displayName: '',
        displayStatus: '',
        overrideDisplayName: '',
        overrideDisplayStatus: '',
      })),
    })

    this.props.navigation.navigate('chats/detail', conversation)
  }

  onSubmit = onSubmit => async () => {
    try {
      this.setNavigationParams({
        onSubmit: null,
        rightBtn: <ActivityIndicator size='small' />,
      })
      await onSubmit(this.state)
    } catch (err) {
      this.setNavigationParams()
      console.error(err)
    }
  }

  render () {
    return null
    // @FIXME: destroyed by refactor
    //    const { contactsID } = this.state
    //    const { context, navigation } = this.props
    //
    //    const currentContactIds = navigation.getParam('currentContactIds', [])
    //
    // return (
    //   <Screen style={[{ backgroundColor: colors.white }]}>
    //     <Pagination
    //       context={context}
    //       query={context.queries.ContactList.graphql}
    //       variables={context.queries.ContactList.defaultVariables}
    //       fragment={fragments.ContactList}
    //       alias='ContactList'
    //       ListHeaderComponent={
    //         <View style={padding}>
    //           <SearchBar
    //             onChangeText={() => {
    //               console.warn('not implemented')
    //             }}
    //           />
    //         </View>
    //       }
    //       ListEmptyComponent={
    //         <View style={padding}>
    //           {currentContactIds.length > 0 ? (
    //             <Text>You can't add anyone to this conversation</Text>
    //           ) : (
    //             <Text>
    //               You need to have contacts before you can create a conversation
    //             </Text>
    //           )}
    //         </View>
    //       }
    //       renderItem={props =>
    //         props.data.status !== 42 &&
    //         currentContactIds.indexOf(props.data.id) === -1 ? (
    //             <Item
    //               {...props}
    //               onPress={() => {
    //                 const index = contactsID.lastIndexOf(props.data.id)
    //                 index < 0
    //                   ? contactsID.push(props.data.id)
    //                   : contactsID.splice(index, 1)
    //                 this.setState({ contactsID })
    //               }}
    //             />
    //           ) : null
    //       }
    //     />
    //   </Screen>
    // )
  }
}

export default ListScreen
