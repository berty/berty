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
        onPressRightBtn={() => navigation.push('Add')}
        searchBar
        searchHandler={navigation.getParam('searchHandler')}
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
              <ContactListWrapper
                state={state}
                retry={retry}
                navigation={navigation}
              />
            )
          }
        </QueryReducer>
      </Screen>
    )
  }
}

class ContactListWrapper extends PureComponent {
  state = {
    list: [].concat(this.props.state.data.ContactList || []),
    filtered: [].concat(this.props.state.data.ContactList || []),
  }

  searchHandler = text => {
    if (text === '') {
      this.setState(state => {
        return { filtered: state.list }
      })
    } else {
      this.setState({
        filtered: this.state.list.filter(
          entry =>
            entry.displayName.toLowerCase().indexOf(text.toLowerCase()) > -1
        ),
      })
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({ searchHandler: this.searchHandler })
  }

  render () {
    const { state, retry, navigation } = this.props
    return (
      <ContactList
        list={this.state.filtered}
        sortBy='displayName'
        state={state}
        retry={retry}
        subtitle='Last seen 3 hours ago ...' // Placeholder
        action='Detail'
        navigation={navigation}
      />
    )
  }
}
