import React from 'react'
import { Platform, Clipboard } from 'react-native'
import { extractPublicKeyFromId, makeShareableUrl, shareLinkOther, shareLinkSelf } from '../../../helpers/contacts'
import saveViewToCamera from '../../../helpers/saveViewToCamera'
import QRCodeExport from '../QRExport'
import ActionList from './ActionList'

const ActionsShare = ({ data, self, inModal }) => {
  const { id, displayName } = data

  const pubKey = extractPublicKeyFromId(id)

  return <ActionList inModal={inModal}>
    {Platform.OS !== 'web' &&
    <ActionList.Action icon={'share'} title={'Share'} action={
      () =>
        self
          ? shareLinkSelf({ id: pubKey, displayName })
          : shareLinkOther({ id: pubKey, displayName })
    } />
    }

    {Platform.OS !== 'web' &&
    <ActionList.Action icon={'image'} title={'Save QR code'} action={() =>
      saveViewToCamera({ view: <QRCodeExport data={{ ...data, id: pubKey }} /> })
    } successMessage={'The QR Code has been added to your Camera Roll'} />
    }

    <ActionList.Action icon={'link'} title={'Copy link'} action={() =>
      Clipboard.setString(makeShareableUrl({ id: pubKey, displayName }))
    } successMessage={'Invite link has been copied'} />

    <ActionList.Action icon={'copy'} title={'Copy public key'} action={() =>
      Clipboard.setString(pubKey)
    } successMessage={'Public key has been copied'} />
  </ActionList>
}

export default ActionsShare
