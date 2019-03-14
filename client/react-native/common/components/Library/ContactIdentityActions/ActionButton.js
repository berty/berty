import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Text from '../Text'
import colors from '../../../constants/colors'

const ActionButton = ({ onPress, color, title, icon }) => <View style={{ flex: 1 }}>
  <TouchableOpacity onPress={onPress || (() => {})}>
    <Text rounded={22} background={color} color={color === colors.white ? colors.subtleGrey : colors.white} icon={icon}
      shadow big center padding margin opacity={onPress ? 1 : 0.3} />
    <Text center color={colors.white} tiny opacity={onPress ? 1 : 0.3}>{title}</Text>
  </TouchableOpacity>
</View>

export const ActionButtonLarge = ({ onPress, color, title, icon }) => <Text
  icon={icon}
  background={color}
  color={color === colors.white ? colors.subtleGrey : colors.white}
  margin={{ left: 4, right: 4 }}
  padding={{
    vertical: 6,
    horizontal: 4,
  }}
  middle
  center
  shadow
  tiny
  rounded={22}
  onPress={onPress || (() => {})}
  opacity={onPress ? 1 : 0.3}
>
  {title}
</Text>

export default ActionButton
ActionButton.Large = ActionButtonLarge
