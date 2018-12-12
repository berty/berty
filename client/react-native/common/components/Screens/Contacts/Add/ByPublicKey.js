import React, { PureComponent } from 'react'
import { View, Clipboard, Platform } from 'react-native'
import { TextInputMultilineFix, Button } from '../../../Library'
import { colors } from '../../../../constants'
import { marginTop, padding, rounded, textTiny } from '../../../../styles'
import { monospaceFont } from '../../../../constants/styling'
import RelayContext from '../../../../relay/RelayContext'
import { showContactModal } from '../../../../helpers/contacts'

class ByPublicKey extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      id: '',
    }
  }

  render () {
    return <RelayContext.Consumer>{relayContext =>
      <View style={{
        flex: 1,
        paddingTop: 48,
        backgroundColor: colors.white,
        alignItems: 'center',
      }}>
        <View style={{
          height: 320,
          width: 320,
        }}>
          <TextInputMultilineFix
            style={[
              {
                width: 310,
                height: 248,
                backgroundColor: colors.grey7,
                color: colors.black,
                flexWrap: 'wrap',
                fontFamily: monospaceFont,
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            placeholder='Paste the public key of a Berty user here'
            value={this.state.id}
            onChangeText={id => this.setState({ id })}
            selectTextOnFocus
          />

          <Button
            background={colors.blue}
            margin
            padding
            rounded={23}
            height={24}
            medium
            middle
            center
            self='stretch'
            onPress={async () => {
              await showContactModal({
                relayContext,
                navigation: this.props.topNavigation,
                data: {
                  id: this.state.id,
                },
              })
            }}
            icon={'plus'}
          >
            Add this key
          </Button>
          {Platform.OS !== 'web'
            ? <Button
              icon={'clipboard'}
              background={colors.blue}
              margin
              padding
              rounded={23}
              height={24}
              medium
              middle
              center
              self='stretch'
              onPress={async () => {
                this.setState({ id: await Clipboard.getString() })
              }}>
              Paste key
            </Button>
            : null}
        </View>
      </View>
    }</RelayContext.Consumer>
  }
}

export default ByPublicKey
