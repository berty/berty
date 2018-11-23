import { Share } from 'react-native'
import { mutations } from '../graphql'
import { atob, btoa } from 'b64-lite'

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
    return ''
  }
}

export const makeShareableUrl = ({ contactId, displayName }) => `https://berty.tech/add-contact#public-key=${encodeURIComponent(contactId)}&display-name=${encodeURIComponent(displayName)}`

export const shareLinkSelf = ({ contactId, displayName }) => {
  const url = makeShareableUrl({ contactId, displayName })

  Share.share({
    title: 'Add me on Berty',
    message: `Use this link to add me on Berty ${url}`,
    url: url,
  }).catch(() => null)
}

export const shareLinkOther = ({ contactId, displayName }) => {
  const url = makeShareableUrl({ contactId, displayName })

  Share.share({
    title: `Add ${displayName} on Berty`,
    message: `Use this link to add ${displayName} on Berty ${url}`,
    url: url,
  }).catch(() => null)
}
