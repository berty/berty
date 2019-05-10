import { View, Clipboard, Platform } from 'react-native'
import { withNamespaces } from 'react-i18next'
import React, { PureComponent } from 'react'

import { TextInputMultilineFix, Button, Flex } from '@berty/view/component'
import { colors } from '@berty/common/constants'
import { marginTop, padding, rounded, textTiny } from '@berty/common/styles'
import { monospaceFont } from '@berty/common/constants/styling'
import { parse as parseUrl } from '@berty/common/helpers/url'
import { withContext as withStoreContext } from '@berty/store/context'

@withStoreContext
class ByPublicKey extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      id: '',
    }
  }

  onAdd = () => {
    const { navigation } = this.props.navigation
    const url = parseUrl(this.state.id)

    if (!url || url.pathname !== '/contacts/add') {
      return navigation.navigate('modal/contacts/card', {
        id: this.state.id,
        displayName: '',
      })
    }

    return navigation.navigate('modal/contacts/card', {
      id: url.hashParts['id'],
      displayName: url.hashParts['display-name'] || '',
    })
  }

  render () {
    const { t } = this.props

    return (
      <View
        style={{
          flex: 1,
          paddingTop: 48,
          backgroundColor: colors.white,
          alignItems: 'center',
        }}
      >
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
            placeholder={t('contacts.add.pub-key-paste-here')}
            value={this.state.id}
            onChangeText={id => this.setState({ id })}
            selectTextOnFocus
          />

          <View style={{ height: 40, paddingTop: 8, flexDirection: 'row' }}>
            {Platform.OS !== 'web' ? (
              <View style={{ paddingRight: 4, flex: 1 }}>
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
                    await new Promise(resolve =>
                      this.setState({ id: clipboardContent }, resolve)
                    )

                    return this.onAdd()
                  }}
                >
                  {t('contacts.add.pub-key-paste')}
                </Button>
              </View>
            ) : null}

            <View
              style={{
                paddingLeft: Platform.OS !== 'web' ? 4 : 0,
                flex: 1,
              }}
            >
              <Button
                background={colors.blue}
                padding
                rounded={4}
                medium
                middle
                center
                self='stretch'
                onPress={async () => {
                  return this.onAdd()
                }}
                icon={'plus'}
              >
                {t('contacts.add.pub-key-add')}
              </Button>
            </View>
          </View>
        </Flex.Rows>
      </View>
    )
  }
}

export default withNamespaces()(ByPublicKey)
