import { Share, Platform } from 'react-native'
import { mutations } from '../graphql'
import { atob, btoa } from 'b64-lite'
import { NavigationActions } from 'react-navigation'
import { showMessage } from 'react-native-flash-message'
import defaultValuesContact from '../utils/contact'
import NavigationService from './NavigationService'
import DeviceInfo from 'react-native-device-info'
import I18n from 'i18next'
import { BASE_WEBSITE_URL } from '../constants'

export const requestContact = async (
  contactId,
  overrideDisplayName,
  displayName,
  navigation,
  errorHandler
) => {
  try {
    await mutations.contactRequest.commit({
      contactId: btoa(`contact:${contactId}`),
      contactOverrideDisplayName: overrideDisplayName || displayName || '',
      introText: '',
    })
    navigation.goBack(null)
  } catch (err) {
    errorHandler(err)
  }
}

export const extractPublicKeyFromId = contactId => {
  try {
    return atob(contactId).split('contact:')[1]
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
    url: url,
  }).catch(() => null)
}

export const shareLinkOther = ({ id, displayName }) => {
  const url = makeShareableUrl({ id, displayName })

  Share.share({
    title: I18n.t('contacts.add.invite-text', { displayName }),
    message: I18n.t('contacts.add.invite-text-link', { displayName, url }),
    url: url,
  }).catch(() => null)
}

export const isPubKeyValid = async ({ queries, data: { id } }) => {
  try {
    const res = await queries.ContactCheckPublicKey.fetch({
      filter: {
        ...defaultValuesContact,
        id: btoa(`contact:${id}`),
      },
    })

    return res.ret
  } catch (e) {
    return false
  }
}

export const showContactModal = async ({
  relayContext: { queries },
  navigation,
  beforeDismiss,
  data,
}) => {
  const extractedPublicKey = extractPublicKeyFromId(data.id)

  if (extractedPublicKey && extractedPublicKey !== '') {
    data = {
      ...data,
      id: extractedPublicKey,
    }
  }

  if (!(await isPubKeyValid({ queries, data }))) {
    showMessage({
      message: I18n.t('contacts.add.invalid-public-key'),
      type: 'danger',
      position: 'top',
      icon: 'danger',
    })

    return false
  }

  NavigationService.action(
    NavigationActions.navigate({
      routeName: 'modal/contacts/card',
      params: {
        data: {
          ...data,
          displayName: data.displayName || '',
        },
        beforeDismiss: beforeDismiss,
      },
    })
  )
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
