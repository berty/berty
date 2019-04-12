import { Alert, Platform } from 'react-native'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'
import I18n from 'i18next'

const exceptionHandler = (error, isFatal) => {
  Alert.alert(
    I18n.t('unexpected-error'),
    `${isFatal ? 'Fatal: ' : ''}${
      !error || typeof error === 'string' ? error : error.toString()
    }`,
    [
      {
        text: I18n.t('restart'),
        onPress: () => RNRestart.Restart(),
      },
      !isFatal && { text: I18n.t('cancel') },
    ],
    { cancelable: false }
  )
}

if (process.env['ENVIRONMENT'] !== 'integration_test') {
  // eslint-disable-next-line
  if (!__DEV__) {
    console.error = error => exceptionHandler(error, false)
  }

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const allowInDevMode = false
    const forceAppQuit = false
    const executeDefaultHandler = false

    setJSExceptionHandler(exceptionHandler, allowInDevMode)
    setNativeExceptionHandler(() => {}, forceAppQuit, executeDefaultHandler)
  }
}
