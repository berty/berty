/* global __DEV__ */

import { Alert, Platform } from 'react-native'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import RNRestart from 'react-native-restart'
import I18n from 'i18next'
import { isIntegrationMode } from '../constants/query'
import Reporter from '@berty/reporter'
import Notifier from '@berty/notifier'

const exceptionHandler = (error, isFatal) => {
  Reporter.crash(error)
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

if (!isIntegrationMode && Platform.OS !== 'web') {
  if (!__DEV__) {
    console.error = error => exceptionHandler(error, false)
  }

  const allowInDevMode = false
  const forceAppQuit = false
  const executeDefaultHandler = true

  setJSExceptionHandler(exceptionHandler, allowInDevMode)
  setNativeExceptionHandler(
    () =>
      Notifier.system({
        title: I18n.t('restart'),
        body: I18n.t('unexpected-error'),
      }),
    forceAppQuit,
    executeDefaultHandler
  )
}
