import moment from 'moment'
import { Platform } from 'react-native'
import { DeviceInfos as GetDeviceInfos } from '../graphql/queries'

export const getAvailableUpdate = async () => {
  if (Platform.OS !== 'ios') {
    return null
  }

  try {
    const deviceData = await GetDeviceInfos.fetch()
    const releases = await fetch('https://yolo.berty.io/release/ios.json').then(res => res.json())

    if (!deviceData) {
      return null
    }

    const [gitData] = deviceData.DeviceInfos.infos.filter(d => d.key === 'build: git')
      .map(({ key, value }) => value
        .split('\n')
        .map(line => line.split('='))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      )

    if (
      gitData === undefined ||
      gitData.mode === 'dev' ||
      !releases.hasOwnProperty('master')
    ) {
      return null
    }

    if (gitData.branch === 'master' && gitData.sha !== releases.master['git-sha']) {
      return releases.master
    }

    const commitDate = moment(gitData['commit-date'], 'YYYY-MM-DD HH:mm:ss ZZ')
    const ciBuildDate = moment(releases.master['stop-time'])

    if (gitData.branch !== 'master' && commitDate.diff(ciBuildDate) < 0) {
      return releases.master
    }
  } catch (e) {
    console.error(e)
  }

  return null
}
