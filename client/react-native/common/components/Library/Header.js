import React, { PureComponent } from 'react'
import { TextInput, View, Platform } from 'react-native'
import { Button, Flex, Text } from '.'
import { colors } from '../../constants'
import {
  paddingLeft,
  paddingRight,
  padding,
  borderBottom,
  paddingBottom,
} from '../../styles'

const [defaultTextColor, defaultBackColor] = [colors.black, colors.white]

const HeaderButton = ({ icon, color, style, ...otherProps }) => {
  return <Button icon={icon} large color={color} {...otherProps} />
}

export default class Header extends PureComponent {
  render () {
    const {
      navigation,
      title,
      titleIcon,
      backBtn,
      rightBtnIcon,
      onPressRightBtn,
      searchBar,
      searchHandler,
    } = this.props

    const colorText =
      this.props.colorText == null ? defaultTextColor : this.props.colorText
    const colorBack =
      this.props.colorBack == null ? defaultBackColor : this.props.colorBack
    const colorBtnLeft =
      this.props.colorBtnLeft == null
        ? defaultTextColor
        : this.props.colorBtnLeft
    const colorBtnRight =
      this.props.colorBtnRight == null
        ? defaultTextColor
        : this.props.colorBtnRight

    return (
      <View
        style={[
          {
            backgroundColor: colorBack,
            height: searchBar ? 100 : 60,
          },
          borderBottom,
          padding,
        ]}
      >
        <Flex.Rows>
          <Flex.Cols
            size={1}
            justify='between'
            align='center'
            style={[searchBar ? paddingBottom : {}]}
          >
            {backBtn === true && (
              <HeaderButton
                icon='arrow-left'
                color={colorBtnLeft}
                onPress={() => navigation.goBack(null)}
                justify='start'
                middle
              />
            )}
            <Text
              icon={titleIcon}
              left
              large
              color={colorText}
              ellipsis
              justify={backBtn ? 'center' : 'start'}
              middle
              size={5}
            >
              {title}
            </Text>
            {rightBtnIcon !== null && (
              <HeaderButton
                icon={rightBtnIcon}
                color={colorBtnRight}
                onPress={onPressRightBtn}
                justify='end'
                middle
              />
            )}
          </Flex.Cols>

          {searchBar === true && (
            <Flex.Cols size={1} style={[paddingBottom]}>
              <TextInput
                underlineColorAndroid='transparent'
                autoCorrect={false}
                style={[
                  {
                    height: 36,
                    flex: 1,
                    backgroundColor: colors.grey7,
                    borderWidth: 0,
                    borderRadius: 18,
                    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
                  },
                  paddingLeft,
                  paddingRight,
                ]}
                placeholder='Search...'
                onChangeText={text => searchHandler(text)}
              />
            </Flex.Cols>
          )}
        </Flex.Rows>
      </View>
    )
  }
}
