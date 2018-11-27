import { Alert, Platform } from 'react-native'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'

const exceptionHandler = (error, isFatal) => {
  Alert.alert(
    'An unexpected error has occurred.',
    `${isFatal ? 'Fatal: ' : ''}${
      !error || typeof error === 'string' ? error : error.toString()
    }`,
    [
      {
        text: 'Restart',
        onPress: () => RNRestart.Restart(),
      },
      !isFatal && { text: 'Cancel' },
    ],
    { cancelable: false }
  )
}

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
