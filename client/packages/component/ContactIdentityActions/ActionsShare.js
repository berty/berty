import React from 'react'
import { Platform, Clipboard } from 'react-native'
import {
  makeShareableUrl,
  shareLinkOther,
  shareLinkSelf,
} from '@berty/common/helpers/contacts'
import saveViewToCamera from '@berty/common/helpers/saveViewToCamera'
import QRCodeExport from '../QRExport'
import ActionList from './ActionList'
import { withNamespaces } from 'react-i18next'
import { withNavigation } from 'react-navigation'

const ActionsShare = ({ data, self, inModal, t, navigation }) => {
  const { id, displayName } = data

  const pubKey = id

  return (
    <ActionList inModal={inModal}>
      {Platform.OS !== 'web' && (
        <ActionList.Action
          icon={'share'}
          title={t('contacts.share-action')}
          action={() =>
            self
              ? shareLinkSelf({ id: pubKey, displayName })
              : shareLinkOther({ id: pubKey, displayName })
          }
        />
      )}

      {Platform.OS !== 'web' && (
        <ActionList.Action
          icon={'image'}
          title={t('contacts.save-qrcode-action')}
          action={() =>
            saveViewToCamera({
              navigation,
              view: <QRCodeExport data={{ ...data, id: pubKey }} />,
            })
          }
          successMessage={t('contacts.save-qrcode-action-feedback')}
        />
      )}

      <ActionList.Action
        icon={'link'}
        title={t('contacts.copy-link-action')}
        action={() =>
          Clipboard.setString(makeShareableUrl({ id: pubKey, displayName }))
        }
        successMessage={t('contacts.copy-link-action-feedback')}
      />

      <ActionList.Action
        icon={'copy'}
        title={t('contacts.copy-pubkey-action')}
        action={() => Clipboard.setString(pubKey)}
        successMessage={t('contacts.copy-pubkey-action-feedback')}
      />
    </ActionList>
  )
}

export default withNavigation(withNamespaces()(ActionsShare))
