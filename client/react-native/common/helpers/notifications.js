import { Platform } from 'react-native'
import I18n from 'i18next'
import { enums } from '../graphql'
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

  if (Platform.OS === 'web') {
    showMessage({
      message: I18n.t('settings.notifications-not-supported'),
      type: 'danger',
      icon: 'danger',
      position: 'top',
    })

    // return false
  }

  await mutations.devicePushConfigNativeRegister({})

  return true
}

export const disableNativeNotifications = async ({ context, pushConfigs }) => {
  const { mutations } = context

  await mutations.devicePushConfigNativeUnregister({})

  return true
}
