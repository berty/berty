import React from 'react'
import { WithContact } from '../../../utils/contact'
import { enums } from '../../../graphql'
import { Text, View } from 'react-native'
import { withNavigation } from 'react-navigation'
import ActionsAdd from './ActionsAdd'
import ActionsShare from './ActionsShare'
import ReceivedActions from './ActionsReceived'
import ActionsSent from './ActionsSent'

const ContactIdentityActions = ({ data, navigation, modalWidth }) => <View
  style={{ width: modalWidth, flexDirection: 'row', marginTop: 12 }}>
  <WithContact id={data.id}>{(user, state) => {
    if (user === null) {
      return <ActionsAdd data={data} navigation={navigation} inModal />
    } else if (user === null) {
      return <View><Text>LOADING (or error)</Text></View>
    } else {
      switch (user.status) {
        case enums.BertyEntityContactInputStatus.Myself:
          return <ActionsShare data={user} self navigation={navigation} inModal />

        case enums.BertyEntityContactInputStatus.IsFriend:
        case enums.BertyEntityContactInputStatus.IsTrustedFriend:
          return <ActionsShare data={user} navigation={navigation} inModal />

        case enums.BertyEntityContactInputStatus.IsRequested:
          console.log(user)
          return <ActionsSent data={user} inModal />

        case enums.BertyEntityContactInputStatus.RequestedMe:
          return <ReceivedActions data={user} inModal />

        case enums.BertyEntityContactInputStatus.IsBlocked:
          return <Text>Is blocked</Text>

        case enums.BertyEntityContactInputStatus.Unknown:
        default:
          return <Text>Unknown state</Text>
      }
    }
  }}</WithContact>
</View>

export default withNavigation(ContactIdentityActions)
