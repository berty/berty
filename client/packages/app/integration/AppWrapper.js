import React, { Component } from 'react'
import { Platform, Alert } from 'react-native'
import { Tester, TestHookStore } from 'cavy'

import Onboarding from './tests/Onboarding.js'
import AppLoading from './tests/AppLoading.js'
import Contact from './tests/Contact.js'
import Chat from './tests/Chat.js'
import DevTools from './tests/DevTools.js'

import {
  reportServerHost,
  reportServerPort,
} from '@berty/common/constants/query'

const testHookStore = new TestHookStore()

const redirectConsoleLogsToTerminal = () => {
  if (Platform.OS !== 'web') {
    let DEBUG_LEVEL = 0
    let INFO_LEVEL = 1
    let WARN_LEVEL = 2
    let ERROR_LEVEL = 3

    console.log = log => global.nativeLoggingHook(log, DEBUG_LEVEL)
    console.info = log => global.nativeLoggingHook(log, INFO_LEVEL)
    console.warn = log => global.nativeLoggingHook(log, WARN_LEVEL)
    console.error = log => global.nativeLoggingHook(log, ERROR_LEVEL)
  }
}

const getReportServerInfos = () => {
  return {
    host: reportServerHost || process.env['REPORT_HOST'] || undefined,
    port:
      parseInt(reportServerPort) ||
      parseInt(process.env['REPORT_PORT']) ||
      undefined,
  }
}

export default class AppWrapper extends Component {
  render() {
    redirectConsoleLogsToTerminal()
    const reportServer = getReportServerInfos()
    Alert.alert('AppWrapper')
    return (
      <Tester
        specs={[Onboarding, AppLoading, Contact, Chat, DevTools]}
        store={testHookStore}
        waitTime={4000}
        startDelay={4000}
        sendReport
        reportServerHost={reportServer.host}
        reportServerPort={reportServer.port}
      >
        {this.props.children}
      </Tester>
    )
  }
}
