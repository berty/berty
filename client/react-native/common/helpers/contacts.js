import { Share } from 'react-native'
import { mutations } from '../graphql'
import { atob, btoa } from 'b64-lite'
import { NavigationActions } from 'react-navigation'
import { showMessage } from 'react-native-flash-message'
import defaultValuesContact from '../utils/contact'
import NavigationService from './NavigationService'

export const requestContact = async (contactId, displayName, navigation, errorHandler) => {
  try {
    await mutations.contactRequest.commit({
      contact: {
        id: btoa(`contact:${contactId}`),
        displayName: displayName,
        displayStatus: '',
        overrideDisplayName: '',
        overrideDisplayStatus: '',
      },
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

export const makeShareableUrl = ({ id, displayName }) => `https://berty.tech/add-contact#public-key=${encodeURIComponent(id)}&display-name=${encodeURIComponent(displayName)}`

export const shareLinkSelf = ({ id, displayName }) => {
  const url = makeShareableUrl({ id, displayName })

  Share.share({
    title: 'Add me on Berty',
    message: `Use this link to add me on Berty ${url}`,
    url: url,
  }).catch(() => null)
}

export const shareLinkOther = ({ id, displayName }) => {
  const url = makeShareableUrl({ id, displayName })

  Share.share({
    title: `Add ${displayName} on Berty`,
    message: `Use this link to add ${displayName} on Berty ${url}`,
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

export const showContactModal = async ({ relayContext: { queries }, navigation, beforeDismiss, data }) => {
  const extractedPublicKey = extractPublicKeyFromId(data.id)

  if (extractedPublicKey && extractedPublicKey !== '') {
    data = {
      ...data,
      id: extractedPublicKey,
    }
  }

  if (!(await isPubKeyValid({ queries, data }))) {
    showMessage({
      message: 'This public key is invalid',
      type: 'danger',
      position: 'center',
      icon: 'danger',
    })

    return false
  }

  NavigationService.action(NavigationActions.navigate({
    routeName: 'modal/contacts/card',
    params: {
      data: {
        ...data,
        displayName: data.displayName || '',
      },
      beforeDismiss: beforeDismiss,
    },
  }))
}
