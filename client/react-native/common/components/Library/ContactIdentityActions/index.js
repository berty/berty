import React from 'react'
import { WithContact } from '../../../utils/contact'
import { enums } from '../../../graphql'
import { Text, View } from 'react-native'
import { withNavigation } from 'react-navigation'
import ActionsAdd from './ActionsAdd'
import ActionsShare from './ActionsShare'

const ContactIdentityActions = ({ data, navigation, modalWidth }) => <View
  style={{ width: modalWidth, flexDirection: 'row', marginTop: 12 }}>
  <WithContact id={data.id}>{(user, state) => {
    if (state.type === state.success && (user === null || user.status === enums.BertyEntityContactInputStatus.Unknown)) {
      return <ActionsAdd data={data} navigation={navigation} />
    } else if (user === null) {
      return <View><Text>LOADING (or error)</Text></View>
    } else {
      switch (user.status) {
        case enums.BertyEntityContactInputStatus.Myself:
          return <ActionsShare data={data} self navigation={navigation} />

        case enums.BertyEntityContactInputStatus.IsFriend:
        case enums.BertyEntityContactInputStatus.IsTrustedFriend:
          return <ActionsShare data={data} navigation={navigation} />

        case enums.BertyEntityContactInputStatus.IsRequested:
          return <Text>Is requested</Text>

        case enums.BertyEntityContactInputStatus.RequestedMe:
          return <Text>Requested me</Text>

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
