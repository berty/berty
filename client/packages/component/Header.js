import { View } from 'react-native'
import React, { PureComponent } from 'react'
import Button from './Button'
import Flex from './Flex'
import Text from './Text'
import { colors } from '@berty/common/constants'
import { padding, borderBottom } from '@berty/common/styles'
import { isRTL } from '@berty/common/locale'
import { withGoBack } from './BackActionProvider'

const [defaultTextColor, defaultBackColor] = [colors.fakeBlack, colors.white]

export const HeaderButton = ({ icon, color, style, ...otherProps }) => {
  return <Button icon={icon} large color={color} {...otherProps} padding />
}

class Header extends PureComponent {
  render() {
    const {
      goBack,
      title,
      titleIcon,
      backBtn,
      rightBtn,
      rightBtnIcon,
      onPressRightBtn,
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
            height: 70,
          },
          borderBottom,
          padding,
        ]}
      >
        <Flex.Cols size={1} justify="between" align="center">
          {backBtn && (
            <Flex.Rows size={1}>
              <HeaderButton
                icon="arrow-left"
                color={colorBtnLeft}
                onPress={() => {
                  if (typeof backBtn === 'function') {
                    backBtn()
                  }
                  goBack(null)
                }}
                flip={isRTL()}
                justify="start"
                middle
              />
            </Flex.Rows>
          )}
          {typeof title !== 'string' ? (
            title
          ) : (
            <Text
              icon={titleIcon}
              left
              large
              color={colorText}
              justify={backBtn ? 'center' : 'start'}
              middle
              size={5}
              ellipsis
            >
              {title}
            </Text>
          )}
          {rightBtn ? <Flex.Block size={1}>{rightBtn}</Flex.Block> : null}
          {!rightBtn && rightBtnIcon !== null && (
            <HeaderButton
              size={1}
              icon={rightBtnIcon}
              color={colorBtnRight}
              onPress={onPressRightBtn}
              justify="end"
              middle
            />
          )}
        </Flex.Cols>
      </View>
    )
  }
}

export default withGoBack(Header)
