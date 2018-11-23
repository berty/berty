import { Image } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Screen, Text } from '../../Library'
import { Pagination } from '../../../relay'
import { borderBottom, marginLeft, padding } from '../../../styles'
import { colors } from '../../../constants'
import { fragments } from '../../../graphql'

const Item = fragments.Contact(
  ({
    data: {
      id,
      overrideDisplayName,
      displayName,
      overrideDisplayStatus,
      displayStatus,
    },
    navigation,
  }) => (
    <Flex.Cols
      align='center'
      onPress={() => {
        navigation.push('contacts/detail', {
          contact: {
            id,
            overrideDisplayName,
            displayName,
          },
        })
      }}
      style={[{ height: 72 }, padding, borderBottom]}
    >
      <Flex.Rows size={1} align='center'>
        <Image
          style={{ width: 40, height: 40, borderRadius: 20, margin: 4 }}
          source={{
            uri: 'https://api.adorable.io/avatars/40/' + id + '.png',
          }}
        />
      </Flex.Rows>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text color={colors.black} left middle>
          {overrideDisplayName || displayName}
        </Text>
        {overrideDisplayStatus || overrideDisplayName ? (
          <Text color={colors.subtleGrey} tiny middle left>
            {overrideDisplayStatus || displayStatus}
          </Text>
        ) : null}
      </Flex.Rows>
    </Flex.Cols>
  )
)

export default class ContactList extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Contacts'
        titleIcon='feather-users'
        rightBtnIcon='user-plus'
        onPressRightBtn={() => navigation.push('contacts/add')}
        searchBar
        searchHandler={navigation.getParam('searchHandler')}
      />
    ),
    tabBarVisible: true,
  })

  searchHandler = search => this.setState({ search })

  render () {
    const {
      screenProps: {
        context: { queries },
      },
    } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <Pagination
          direction='forward'
          query={queries.ContactList.graphql}
          variables={queries.ContactList.defaultVariables}
          fragment={fragments.ContactList}
          connection='ContactList'
          renderItem={props => (
            <Item {...props} navigation={this.props.navigation} />
          )}
        />
      </Screen>
    )
  }
}
