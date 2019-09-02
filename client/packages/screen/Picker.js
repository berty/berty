import { Platform, View } from 'react-native'
import React from 'react'
import { isIntegrationMode } from '@berty/common/constants/query'

export class Picker extends React.Component {
  constructor(props) {
    super(props)

    this.props.navigation.navigate(
      // TODO: when will find a way to use all our components in component, implement skip of onboarding in test replace the next line by:
      // this.props.screenProps.firstLaunch || isIntegrationMode
      (Platform.OS !== 'web' || Platform.Desktop) &&
        this.props.navigation.getParam('firstLaunch', false) &&
        !isIntegrationMode
        ? 'switch/onboarding'
        : 'switch/main'
    )
  }

  render() {
    return <View />
  }
}
