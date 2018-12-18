import { PermissionsAndroid } from 'react-native'

export const requestAndroidPermission = async ({ permission, title, message }) => {
  try {
    const granted = await PermissionsAndroid.request(
      permission,
      {
        title,
        message,
      },
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  } catch (err) {
    console.warn(err)
  }

  return false
}
