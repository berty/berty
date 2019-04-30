import { Platform } from 'react-native'
import I18n from 'i18next'
import { enums } from '@berty/graphql'
import { showMessage } from 'react-native-flash-message'

export const getNativePushType = () => {
  if (Platform.OS === 'ios') {
    return enums.BertyPushDevicePushTypeInputDevicePushType.APNS
  } else if (Platform.OS === 'android') {
    return enums.BertyPushDevicePushTypeInputDevicePushType.FCM
  }

  return enums.BertyPushDevicePushTypeInputDevicePushType.UnknownDevicePushType
}

export const enableNativeNotifications = async ({ context }) => {
  const { mutations } = context

  if (Platform.Desktop) {
    return true
  }

  if (Platform.OS === 'web') {
    showMessage({
      message: I18n.t('settings.notifications-not-supported'),
      type: 'danger',
      icon: 'danger',
      position: 'top',
    })

    return false
  }

  await mutations.devicePushConfigNativeRegister({})

  return true
}

export const enableMQTTNotifications = async ({
  context,
  relayPubkey,
  pushId,
}) => {
  const { mutations } = context

  await mutations.devicePushConfigCreate({
    pushType: enums.BertyPushDevicePushTypeInputDevicePushType.MQTT,
    pushId: pushId.split('').map(e => e.charCodeAt()),
    relayPubkey: relayPubkey,
  })

  return true
}

export const disableMQTTNotifications = async ({
  context,
  currentPushConfigs,
}) => {
  const { mutations } = context

  for (let currentPushConfig of currentPushConfigs) {
    await mutations.devicePushConfigRemove({
      id: currentPushConfig.id,
    })
  }

  return true
}

export const disableNativeNotifications = async ({ context }) => {
  const { mutations } = context

  await mutations.devicePushConfigNativeUnregister({})

  return true
}
