import React from 'react'
import { withNavigation } from 'react-navigation'
import { Clipboard } from 'react-native'
import { makeShareableUrl, shareLinkOther, shareLinkSelf } from '../../../helpers/contacts'
import saveViewToCamera from '../../../helpers/saveViewToCamera'
import QRCodeExport from '../QRExport'
import ActionButton from './ActionButton'
import { showMessage } from 'react-native-flash-message'

const ActionsShare = ({ data, self, navigation }) => {
  const { id, displayName } = data

  return <>
    <ActionButton icon={'share'} title={'Share'}
      onPress={() =>
        self
          ? shareLinkSelf({ id, displayName })
          : shareLinkOther({ id, displayName })
      }
    />
    <ActionButton icon={'image'} title={'Save QR code'}
      onPress={async () => {
        try {
          await saveViewToCamera({ view: <QRCodeExport data={data} />, navigation })
          showMessage({
            message: 'The QR Code has been added to your Camera Roll',
            type: 'info',
            icon: 'info',
            position: 'center',
          })
        } catch (e) {
          showMessage({
            message: String(e),
            type: 'danger',
            icon: 'danger',
            position: 'center',
          })
        }
      }} />
    <ActionButton icon={'link'} title={'Copy link'}
      onPress={() => Clipboard.setString(makeShareableUrl({ id, displayName }))} />
    <ActionButton icon={'copy'} title={'Copy public key'} onPress={() => Clipboard.setString(id)} />
  </>
}

export default withNavigation(ActionsShare)
