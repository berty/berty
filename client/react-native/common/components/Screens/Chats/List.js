import React, { PureComponent } from 'react'

import { Pagination } from '../../../relay'
import { Screen, Header, ListItem } from '../../Library'
import { colors } from '../../../constants'
import { fragments, queries } from '../../../graphql'
import { conversation as utils } from '../../../utils'

const Item = fragments.Conversation(({ data, navigation, onPress }) => {
  return (
    <ListItem
      id={data.id}
      title={utils.getTitle(data)}
      subtitle='Last message sent 3 hours ago...' // Placeholder
      onPress={() => navigation.push('chats/detail', { conversation: data })}
    />
  )
})

export default class ListScreen extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Chats'
        titleIcon='message-circle'
        rightBtnIcon='edit'
        searchBar
        searchHandler={navigation.getParam('searchHandler')} // Placeholder
        onPressRightBtn={() =>
          navigation.push('chats/add', {
            goBack: () => {
              navigation.goBack(null)
              const retry = navigation.getParam('retry')
              retry && retry()
            },
          })
        }
      />
    ),
    tabBarVisible: true,
  })

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Pagination
          direction='forward'
          query={queries.ConversationList}
          variables={queries.ConversationList.defaultVariables}
          fragment={fragments.ConversationList.default}
          connection='ConversationList'
          renderItem={props => <Item {...props} navigation={navigation} />}
        />
      </Screen>
    )
  }
}
