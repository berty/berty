import { Platform } from 'react-native'

export default function (spec) {
  spec.describe('App loading', function () {
    spec.it('works', async function () {
      const androidLoadingTimeout = 30000
      const iosLoadingTimeout = 10000
      const webLoadingTimeout = 2000
      const loadingTimeout = () => {
        switch (Platform.OS) {
          case 'web':
            return webLoadingTimeout
          case 'android':
            return androidLoadingTimeout
          case 'ios':
            return iosLoadingTimeout
          default:
            return 0
        }
      }

      console.info(
        'Wait for app loaded - timeout ' + loadingTimeout() / 1000 + ' sec'
      )
      await spec.pause(loadingTimeout())

      console.info('Check if empty conversation list loaded correctly')
      await spec.exists('ChatList.NewConvButton')
    })
  })
}
