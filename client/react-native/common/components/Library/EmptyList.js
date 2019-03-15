import { Image, View, Text, TouchableOpacity } from 'react-native'
import React, { PureComponent } from 'react'

import colors from '../../constants/colors'
import Icon from './Icon'

export default class EmptyList extends PureComponent {
  state = {
    fontWidth: 0,
  }

  static defaultProps = {
    source: '',
    text: '',
    onPress: null,
    icon: '',
    btnText: '',
  }

  render () {
    const { source, text, onPress, icon, btnText, btnRef } = this.props
    const fontSize = this.state.fontWidth * 0.07

    return (
      <View style={{ flex: 1, marginTop: 15 }}>
        <Image
          style={{
            width: undefined,
            height: undefined,
            flex: 7,
            marginHorizontal: 30,
          }}
          source={source}
          resizeMode='contain'
        />
        <Text style={{ alignSelf: 'center', color: colors.lightGrey, flex: 1 }}>
          {text}
        </Text>
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: colors.blue,
            borderRadius: 25,
            marginBottom: 30,
            marginTop: 25,
            width: '51%',
            alignSelf: 'center',
            paddingHorizontal: 14,
            minHeight: '7%',
          }}
        >
          <View
            ref={btnRef}
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onLayout={e =>
              this.setState({ fontWidth: e.nativeEvent.layout.width })
            }
          >
            <Icon style={{ color: colors.white, fontSize }} name={icon} />
            <Text
              style={{
                fontSize: fontSize,
                color: colors.white,
                display: 'flex',
                textAlign: 'center',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {btnText.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}
