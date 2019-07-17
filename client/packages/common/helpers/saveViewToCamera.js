import ViewShot from 'react-native-view-shot'
import React, { Component } from 'react'
import { View, CameraRoll, Platform, PermissionsAndroid } from 'react-native'
import { requestAndroidPermission } from './permissions'
import I18n from '../locale'

export class ViewExportComponent extends Component {
  async componentDidMount() {
    const resolve = this.props.navigation.getParam('resolve')
    const reject = this.props.navigation.getParam('reject')

    try {
      const uri = await this.refs.viewShot.capture({ format: 'jpg' })

      resolve(uri)
    } catch (e) {
      reject(e)
    }

    this.props.navigation.goBack(null)
  }

  render() {
    const view = this.props.navigation.getParam('view')

    return (
      <View style={{ opacity: 0 }}>
        <ViewShot ref="viewShot">{view}</ViewShot>
      </View>
    )
  }
}

export default async ({ view, navigation }) => {
  if (Platform.OS === 'android') {
    const allowed = await requestAndroidPermission({
      permission: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      title: I18n.t('settings.save-picture-perm'),
      message: I18n.t('settings.save-picture-perm-desc'),
    })

    if (!allowed) {
      throw new Error(I18n.t('settings.save-picture-perm-denied'))
    }
  }

  if (Platform.OS === 'web') {
    throw new Error('unsupported on web')
  }

  try {
    const uri = await new Promise((resolve, reject) => {
      navigation.navigate('virtual/view-export', {
        resolve,
        reject,
        view,
      })
    })

    await CameraRoll.saveToCameraRoll(uri, 'photo')
  } catch (e) {
    throw e
  }
}
