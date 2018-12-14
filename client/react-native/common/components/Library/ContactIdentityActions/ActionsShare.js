import React from 'react'
import { Clipboard } from 'react-native'
import { makeShareableUrl, shareLinkOther, shareLinkSelf } from '../../../helpers/contacts'
import saveViewToCamera from '../../../helpers/saveViewToCamera'
import QRCodeExport from '../QRExport'
import ActionList from './ActionList'

const ActionsShare = ({ data, self, inModal }) => {
  const { id, displayName } = data

  return <ActionList inModal={inModal}>
    <ActionList.Action icon={'share'} title={'Share'} action={
      () =>
        self
          ? shareLinkSelf({ id, displayName })
          : shareLinkOther({ id, displayName })
    } />

    <ActionList.Action icon={'image'} title={'Save QR code'} action={() =>
      saveViewToCamera({ view: <QRCodeExport data={data} /> })
    } successMessage={'The QR Code has been added to your Camera Roll'} />

    <ActionList.Action icon={'link'} title={'Copy link'} action={() =>
      Clipboard.setString(makeShareableUrl({ id, displayName }))
    } successMessage={'Invite link has been copied'} />

    <ActionList.Action icon={'copy'} title={'Copy public key'} action={() =>
      Clipboard.setString(id)
    } successMessage={'Public key has been copied'} />
  </ActionList>
}

export default ActionsShare
