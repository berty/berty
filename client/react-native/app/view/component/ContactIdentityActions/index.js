import React from 'react'
import { enums } from '@berty/graphql'
import { Text, View } from 'react-native'
import { withNavigation } from 'react-navigation'
import ActionsAdd from './ActionsAdd'
import ActionsShare from './ActionsShare'
import ReceivedActions from './ActionsReceived'
import ActionsSent from './ActionsSent'

const Actions = ({ data, navigation }) => {
  switch (data.status) {
    case null:
    case undefined:
      return <ActionsAdd data={data} navigation={navigation} inModal />

    case enums.BertyEntityContactInputStatus.Myself:
      return <ActionsShare data={data} self navigation={navigation} inModal />

    case enums.BertyEntityContactInputStatus.IsFriend:
    case enums.BertyEntityContactInputStatus.IsTrustedFriend:
      return <ActionsShare data={data} navigation={navigation} inModal />

    case enums.BertyEntityContactInputStatus.IsRequested:
      return <ActionsSent data={data} inModal />

    case enums.BertyEntityContactInputStatus.RequestedMe:
      return <ReceivedActions data={data} inModal />

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
