import { Alert, Platform } from 'react-native'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'

// eslint-disable-next-line
if (__DEV__ == null || __DEV__ == false) {
  console.error = console.warn
}

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  const exceptionHandler = (error, isFatal) => {
    Alert.alert(
      null,
      `An unexpected error has occurred. Please restart to continue.
      ${typeof isFatal === 'undefined' || isFatal ? 'Fatal ' : ''} Error:
      ${typeof error === 'string' ? error : error.name + ' ' + error.message}
      `,
      [
        {
          text: 'Restart',
          onPress: () => RNRestart.Restart(),
        },
      ],
      { cancelable: false }
    )
  }
  const allowInDevMode = false
  const forceAppQuit = false
  const executeDefaultHandler = false

  setJSExceptionHandler(exceptionHandler, allowInDevMode)
  setNativeExceptionHandler(() => {}, forceAppQuit, executeDefaultHandler)
}
