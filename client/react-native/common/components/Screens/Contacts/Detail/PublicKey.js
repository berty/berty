import React, { PureComponent } from 'react'
import { colors } from '../../../../constants'
import {
  Screen,
  Header,
  PublicKeyWithActions,
} from '../../../Library'
import {
  paddingVertical,
} from '../../../../styles'

export default class DetailPublicKey extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    header: <Header navigation={navigation} title='Public key' backBtn />,
  })

  render () {
    const id = this.props.navigation.getParam('id')
    const displayName = this.props.navigation.getParam('displayName')

    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <PublicKeyWithActions initialKey={id} initialName={displayName} copyButton shareButton readOnly self={false} />
      </Screen>
    )
  }
}
