import React, { PureComponent } from 'react'
import { View, Clipboard, Platform } from 'react-native'
import { TextInputMultilineFix, Button, Flex } from '../../../Library'
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
        <Flex.Rows>
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

          <View style={{ height: 40, paddingTop: 8, flexDirection: 'row' }}>
            {Platform.OS !== 'web'
              ? <View style={{ paddingRight: 4, flex: 1 }}>
                <Button
                  icon={'clipboard'}
                  background={colors.blue}
                  padding
                  rounded={4}
                  medium
                  middle
                  center
                  self='stretch'
                  onPress={async () => {
                    const clipboardContent = await Clipboard.getString()
                    await new Promise(resolve => this.setState({ id: clipboardContent }, resolve))
                    await showContactModal({
                      relayContext,
                      data: {
                        id: this.state.id,
                      },
                    })
                  }}>
                  Paste key
                </Button>
              </View> : null}

            <View style={{ paddingLeft: Platform.OS !== 'web' ? 4 : 0, flex: 1 }}>
              <Button
                background={colors.blue}
                padding
                rounded={4}
                medium
                middle
                center
                self='stretch'
                onPress={async () => {
                  await showContactModal({
                    relayContext,
                    data: {
                      id: this.state.id,
                    },
                  })
                }}
                icon={'plus'}
              >
                Add this key
              </Button>
            </View>
          </View>
        </Flex.Rows>
      </View>
    }</RelayContext.Consumer>
  }
}

export default ByPublicKey
