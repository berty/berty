import React, { PureComponent } from 'react'
import { Screen, ContactList } from '../../../Library'
import { colors } from '../../../../constants'
import { QueryReducer } from '../../../../relay'
import { queries, subscriptions } from '../../../../graphql'
import { borderBottom } from '../../../../styles'
import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

class Request extends PureComponent {
  componentDidMount () {
    this.subscriber = subscriptions.contactRequest.subscribe({
      updater: (store, data) => this.retry && this.retry(),
    })
  }

  componentWillUnmount () {
    this.subscriber.unsubscribe()
  }

  render () {
    const { navigation } = this.props
    const {
      state: { routeName },
    } = navigation

    const filter = routeName === 'Received' ? 'RequestedMe' : 'IsRequested'
    const subtitle =
      routeName === 'Received'
        ? 'Request received 3 hours ago ...'
        : 'Request sent 3 hours ago ...' // Placeholder

    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => {
            this.retry = retry
            return (
              <ContactList
                list={[]
                  .concat(state.data.ContactList || [])
                  .filter(entry => entry.status === filter)}
                state={state}
                retry={retry}
                subtitle={subtitle}
                action='RequestValidation'
                navigation={navigation}
              />
            )
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    Received: Request,
    Sent: Request,
  },
  {
    initialRouteName: 'Received',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'top',

    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.black,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  }
)
