import { Platform, Share } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import I18n from 'i18next'

import { BASE_WEBSITE_URL } from '../constants'

export const extractPublicKeyFromId = id => {
  try {
    return id
  } catch (e) {
    console.warn(e)
  }

  return ''
}

export const makeShareableUrl = ({ id, displayName }) =>
  `${BASE_WEBSITE_URL}/contacts/add#id=${encodeURIComponent(
    id
  )}&display-name=${encodeURIComponent(displayName)}`

export const shareLinkSelf = ({ id, displayName }) => {
  const url = makeShareableUrl({ id, displayName })

  Share.share({
    title: I18n.t('contacts.add.invite-text-self'),
    message: I18n.t('contacts.add.invite-text-link-self', { url }),
    url,
  }).catch(() => null)
}

export const shareLinkOther = ({ id, displayName }) => {
  const url = makeShareableUrl({ id, displayName })

  Share.share({
    title: I18n.t('contacts.add.invite-text', { displayName }),
    message: I18n.t('contacts.add.invite-text-link', { displayName, url }),
    url,
  }).catch(() => null)
}

export const isPubKeyValid = async ({ context, id }) => {
  try {
    return context.node.service.contactCheckPublicKey({ id })
  } catch (e) {
    return false
  }
}

export const defaultUsername = () => {
  if (Platform.OS !== 'ios') {
    return ''
  }

  let deviceName = DeviceInfo.getDeviceName()
  const defaultNamesParts = ['iPhone', 'iPad', 'iPod']

  if (!deviceName) {
    return ''
  }

  deviceName = deviceName.replace("'s ", ' ')

  const hasDefaultName = defaultNamesParts.some(
    defaultPart => deviceName.indexOf(defaultPart) !== -1
  )

  if (hasDefaultName) {
    return (
      deviceName
        // Split device name
        .split(' ')
        // Remove product name
        .filter(
          part =>
            !defaultNamesParts.some(
              defaultPart => part.indexOf(defaultPart) !== -1
            )
        )
        // Keep the longest word
        .sort((a, b) => b.length - a.length)[0]
    )
  }

  return deviceName
}
