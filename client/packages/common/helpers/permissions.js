import { PermissionsAndroid } from 'react-native'
import I18n from '@berty/common/locale'

export const requestAndroidPermission = async ({
  permission,
  title,
  message,
}) => {
  try {
    if (await PermissionsAndroid.check(permission)) return true

    const granted = await PermissionsAndroid.request(permission, {
      title,
      message,
      buttonPositive: I18n.t('permission.buttonPositive'),
      buttonNegative: I18n.t('permission.buttonNegative'),
      buttonNeutral: I18n.t('permission.buttonNeutral'),
    })
    return granted === PermissionsAndroid.RESULTS.GRANTED
  } catch (err) {
    console.warn(err)
  }

  return false
}

export const requestBLEAndroidPermission = async () => {
  return await requestAndroidPermission({
    permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    title: I18n.t('permission.ble.title'),
    message: I18n.t('permission.ble.message'),
  })
}
