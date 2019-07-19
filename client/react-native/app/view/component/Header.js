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
        <Flex.Rows>
          <Flex.Cols size={1} justify="between" align="center">
            {backBtn && (
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
              >
                {title}
              </Text>
            )}
            {rightBtn ? <View>{rightBtn}</View> : null}
            {!rightBtn && rightBtnIcon !== null && (
              <HeaderButton
                icon={rightBtnIcon}
                color={colorBtnRight}
                onPress={onPressRightBtn}
                justify="end"
                middle
              />
            )}
          </Flex.Cols>
        </Flex.Rows>
      </View>
    )
  }
}

export default withGoBack(Header)
