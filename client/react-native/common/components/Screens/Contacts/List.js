// TODO: create generic contact list with pagination

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
        rightBtnIcon='user-plus'
        onPressRightBtn={() => navigation.push('contacts/add')}
        searchBar
        searchHandler={navigation.getParam('searchHandler')}
      />
    ),
    tabBarVisible: true,
  })

  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => (
            <ContactListWrapper
              state={state}
              retry={retry}
              navigation={navigation}
            />
          )}
        </QueryReducer>
      </Screen>
    )
  }
}

class ContactListWrapper extends PureComponent {
  state = {
    search: '',
  }

  searchHandler = search => this.setState({ search })

  filter = ContactList => {
    const { search } = this.state
    if (search === '') {
      return ContactList
    } else {
      return ContactList.filter(
        entry =>
          entry.displayName.toLowerCase().indexOf(search.toLowerCase()) > -1
      )
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({ searchHandler: this.searchHandler })
    this.subscribers = [
      subscriptions.contactRequest.subscribe({
        updater: (store, data) => this.props.retry && this.props.retry(),
      }),
      subscriptions.contactRequestAccepted.subscribe({
        updater: (store, data) => this.props.retry && this.props.retry(),
      }),
    ]
  }

  componentWillUnmount () {
    this.subscribers.forEach(subscriber => subscriber.unsubscribe())
  }

  render () {
    const { state, retry, navigation } = this.props
    return (
      <ContactList
        list={this.filter(state.data.ContactList || [])}
        sortBy='displayName'
        state={state}
        retry={retry}
        subtitle='Last seen 3 hours ago ...' // Placeholder
        action='contacts/detail'
        navigation={navigation}
      />
    )
  }
}
