import moment from 'moment'
import { DeviceInfos } from '../graphql/queries'
import RNDeviceInfo from 'react-native-device-info'
import { Linking, Platform, PermissionsAndroid } from 'react-native'
import RNFetchBlob from './rn-fetch-blob'
import { showMessage } from 'react-native-flash-message'
import { requestAndroidPermission } from './permissions'
import I18n from 'i18next'

const updateApiSources = {
  'chat.berty.ios.staff': {
    url: 'https://yolo.berty.io/release/ios-staff.json',
    channel: 'dev',
  },
  'chat.berty.ios.debug': {
    url: 'https://yolo.berty.io/release/ios-staff.json',
    channel: 'dev',
  },
  'chat.berty.ios': {
    url: 'https://yolo.berty.io/release/ios.json',
    channel: 'dev',
  },
  'chat.berty.ios.yolo': {
    url: 'https://yolo.berty.io/release/ios.json',
    channel: 'beta',
  },
  'chat.berty.main.debug': {
    url: 'https://yolo.berty.io/release/android.json',
    channel: 'dev',
  },
  'chat.berty.main': {
    url: 'https://yolo.berty.io/release/android.json',
    channel: 'beta',
  },
}

export const getAvailableUpdate = async context => {
  const installedVersion = await getInstalledVersion(context)
  const latestVersion = await getLatestVersion()

  return shouldUpdate(installedVersion, latestVersion) ? latestVersion.installUrl : null
}

export const getInstalledVersion = async context => {
  const bundleId = RNDeviceInfo.getBundleId()

  if (!updateApiSources.hasOwnProperty(bundleId)) {
    return null
  }

  const { channel } = updateApiSources[bundleId]
  const deviceData = await DeviceInfos(context).fetch()
  const [rawVersionInfo] = deviceData.infos.filter(d => d.key === 'versions').map(d => d.value)

  const {
    Core: {
      GitSha: hash,
      GitBranch: branch,
      CommitDate: rawCommitDate,
    },
  } = JSON.parse(rawVersionInfo)

  return {
    channel,
    hash: hash,
    branch: branch,
    buildDate: moment(rawCommitDate, 'YYYY-MM-DD HH:mm:ss ZZ'),
    installUrl: null,
  }
}

export const getLatestVersion = async () => {
  const bundleId = RNDeviceInfo.getBundleId()

  if (!updateApiSources.hasOwnProperty(bundleId)) {
    return null
  }

  const { channel, url } = updateApiSources[bundleId]

  const releasesTimeout = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('timeouted'))
    }, 5000)

    fetch(url).then(res => res.json()).then((r) => {
      clearTimeout(timeoutId)
      resolve(r)
    })
  })

  try {
    const releases = await releasesTimeout

    if (!releases.master) {
      return null
    }

    return {
      channel,
      branch: 'master',
      hash: releases.master['git-sha'],
      buildDate: moment(releases.master['stop-time']),
      installUrl: releases.master['manifest-url'],
    }
  } catch (e) {
    return null
  }
}

export const installUpdate = async installUrl => {
  if (Platform.OS === 'ios') {
    showMessage({
      message: I18n.t('settings.update-downloading'),
      type: 'info',
      icon: 'info',
      position: 'top',
    })

    Linking.openURL(installUrl).catch(e =>
      console.error(e),
    )
  } else if (Platform.OS === 'android') {
    const allowed = await requestAndroidPermission({
      permission: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      title: I18n.t('settings.update-write-perm'),
      message: I18n.t('settings.update-write-perm-desc'),
    })

    if (!allowed) {
      showMessage({
        message: I18n.t('settings.update-write-fail'),
        type: 'danger',
        icon: 'danger',
        position: 'top',
      })

      return
    }

    showMessage({
      message: I18n.t('settings.update-downloading'),
      type: 'info',
      icon: 'info',
      position: 'top',
    })

    RNFetchBlob
      .config({
        addAndroidDownloads: {
          title: 'berty-update.apk',
          useDownloadManager: true,
          mediaScannable: true,
          notification: true,
          description: 'File downloaded by download manager.',
          path: `${RNFetchBlob.fs.dirs.DownloadDir}/berty-update.apk`,
        },
      })
      .fetch('GET', installUrl)
      .then((res) => {
        RNFetchBlob.android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
      }).catch(e => {
        showMessage({
          message: String(e),
          type: 'danger',
          icon: 'danger',
          position: 'top',
        })
      })
  }
}

export const shouldUpdate = (installedVersion, latestVersion) => {
  if (!installedVersion || !latestVersion || installedVersion.hash === latestVersion.hash) {
    return false
  }

  return (installedVersion.branch === 'master') ||
    (installedVersion.branch !== 'master' && installedVersion.buildDate.diff(latestVersion.buildDate) < 0)
}
