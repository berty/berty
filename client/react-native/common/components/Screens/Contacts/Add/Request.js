import React, { PureComponent } from 'react'
import { Screen, ContactList } from '../../../Library'
import { colors } from '../../../../constants'
import { QueryReducer } from '../../../../relay'
import { queries, subscriptions } from '../../../../graphql'

export default class Request extends PureComponent {
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
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => {
            this.retry = retry
            return (
              <ContactList
                list={[]
                  .concat(state.data.ContactList || [])
                  .filter(entry => entry.status === 'RequestedMe')}
                state={state}
                retry={retry}
                subtitle='Request received 3 hours ago ...' // Placeholder
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
