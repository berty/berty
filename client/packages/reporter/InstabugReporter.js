/* global __DEV__ */

import { Platform } from 'react-native'
import Instabug, { BugReporting } from 'instabug-reactnative'
import Config from '@berty/config'
import Notifier from '@berty/notifier'
import I18n from 'i18next'

// default configuration
const {
  INSTABUG_TOKEN = null,
  INSTABUG_INVOCATION_EVENT = __DEV__ ? 'none' : 'shake',
  INSTABUG_WELCOME_MESSAGE_MODE = 'disabled', // 'disabled' | 'beta' | 'live'
  INSTABUG_REPRO_STEPS_MODE = 'enabled', // 'enabled' | 'enabledWithNoScreenshots' | 'disabled'
  // FIXME: line 47
  // eslint-disable-next-line
  INSTABUG_USER_STEPS_ENABLED = true,
  INSTABUG_SESSION_PROFILER_ENABLED = true,
  INSTABUG_VIEW_HIERARCHY_ENABLED = true,
  INSTABUG_BUG_REPORTING_ENABLED = true,
  INSTABUG_BUG_REPORTING_AUTO_SCREEN_RECORDING = false,
  INSTABUG_CRASH_REPORTING_ENABLED = true,
} = Config

// definition
const InstabugReporter = {
  menu: Instabug.show,
  feedback: () => Instabug.showWithOptions(BugReporting.reportType.feedback),
  question: () => Instabug.showWithOptions(BugReporting.reportType.question),
  bug: () => Instabug.showWithOptions(BugReporting.reportType.bug),
  crash: error => Instabug.reportJSException(error),
}

// implementation
Instabug.setWelcomeMessageMode(
  Instabug.welcomeMessageMode[INSTABUG_WELCOME_MESSAGE_MODE]
)

Instabug.setReproStepsMode(
  Instabug.reproStepsMode[
    Platform.OS === 'ios'
      ? INSTABUG_REPRO_STEPS_MODE === 'enabled'
        ? 'enabledWithNoScreenshots'
        : 'disabled'
      : INSTABUG_REPRO_STEPS_MODE
  ]
)
Instabug.setSessionProfilerEnabled(INSTABUG_SESSION_PROFILER_ENABLED)
Instabug.setViewHierarchyEnabled(INSTABUG_VIEW_HIERARCHY_ENABLED)

// FIXME: setUserStepsEnabled doesn't exist
// Platform.OS === 'ios' &&
//   Instabug.setUserStepsEnabled(INSTABUG_USER_STEPS_ENABLED)

BugReporting.setEnabled(INSTABUG_BUG_REPORTING_ENABLED)
BugReporting.setInvocationOptions([
  BugReporting.invocationOptions.emailFieldOptional,
  BugReporting.invocationOptions.commentFieldRequired,
])
// FIXME: android: attempt to invoke method intValue on a null object ref, ios: unrecognized selector sent to instance
// BugReporting.setReportTypes([
//   BugReporting.reportType.bug,
//   BugReporting.reportType.feedback,
//   BugReporting.reportType.question,
// ])
Instabug.setCrashReportingEnabled(INSTABUG_CRASH_REPORTING_ENABLED)
Platform.OS === 'ios' && BugReporting.setAutoScreenRecordingMaxDuration(20)
BugReporting.setAutoScreenRecordingEnabled(
  INSTABUG_BUG_REPORTING_AUTO_SCREEN_RECORDING
)

BugReporting.onReportSubmitHandler(function() {
  Notifier.system({
    title: I18n.t('restart'),
    body: I18n.t('unexpected-error'),
  })
})

Instabug.startWithToken(INSTABUG_TOKEN, [
  Instabug.invocationEvent[INSTABUG_INVOCATION_EVENT],
])

if (__DEV__) {
  const DevMenu = require('react-native-dev-menu')
  DevMenu.addItem('Show Instabug', () => BugReporting.invoke())
}

export default InstabugReporter
