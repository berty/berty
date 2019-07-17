import React from 'react'
import * as enums from '@berty/common/enums.gen'
import { Text, View } from 'react-native'
import { withNavigation } from 'react-navigation'
import ActionsAdd from './ActionsAdd'
import ActionsShare from './ActionsShare'
import ReceivedActions from './ActionsReceived'
import ActionsSent from './ActionsSent'

const Actions = ({ data, context, navigation }) => {
  switch (data.status) {
    case null:
    case undefined:
      return (
        <ActionsAdd
          data={data}
          context={context}
          navigation={navigation}
          inModal
        />
      )

    case enums.BertyEntityContactInputStatus.Myself:
      return <ActionsShare data={data} self navigation={navigation} inModal />

    case enums.BertyEntityContactInputStatus.IsFriend:
    case enums.BertyEntityContactInputStatus.IsTrustedFriend:
      return <ActionsShare data={data} navigation={navigation} inModal />

    case enums.BertyEntityContactInputStatus.IsRequested:
      return <ActionsSent data={data} context={context} inModal />

    case enums.BertyEntityContactInputStatus.RequestedMe:
      return <ReceivedActions data={data} context={context} inModal />

    case enums.BertyEntityContactInputStatus.IsBlocked:
      return <Text>Is blocked</Text>

    case enums.BertyEntityContactInputStatus.Unknown:
    default:
      return <Text>Unknown state</Text>
  }
}

const ContactIdentityActions = ({ modalWidth, ...props }) => (
  <View style={{ width: modalWidth, flexDirection: 'row', marginTop: 12 }}>
    <Actions {...props} />
  </View>
)

export default withNavigation(ContactIdentityActions)
