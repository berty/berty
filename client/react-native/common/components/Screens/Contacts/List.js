import React, { PureComponent } from 'react'
import { Screen, Header, ContactList } from '../../Library'
import { colors } from '../../../constants'
import { QueryReducer } from '../../../relay'
import { queries, subscriptions } from '../../../graphql'

// TODO: implement pagination

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Contacts'
        titleIcon='feather-users'
        backBtn
        rightBtnIcon='user-plus'
        onPressRightBtn={() => navigation.push('Add')}
        searchBar
      />
    ),
    tabBarVisible: true,
  })

  componentDidMount () {
    this.subscribers = [
      subscriptions.contactRequest.subscribe({
        updater: (store, data) => this.retry && this.retry(),
      }),
      subscriptions.contactRequestAccepted.subscribe({
        updater: (store, data) => this.retry && this.retry(),
      }),
    ]
  }

  componentWillUnmount () {
    this.subscribers.forEach(subscriber => subscriber.unsubscribe())
  }

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) =>
            (this.retry = retry) && (
              <ContactList
                list={[].concat(state.data.ContactList || [])}
                sortBy='displayName'
                state={state}
                retry={retry}
                subtitle='Last seen 3 hours ago ...' // Placeholder
                action='Detail'
                navigation={navigation}
              />
            )
          }
        </QueryReducer>
      </Screen>
    )
  }
}
