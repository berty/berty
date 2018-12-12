import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Button, Icon } from '..'
import colors from '../../../constants/colors'

const ActionButton = ({ icon, title, onPress }) => <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
  <Button rounded={'circle'} background={colors.blue} color={colors.white}
    icon={<Icon name={icon} color={colors.white} />} />
  <Text style={{ color: colors.white }}>{title}</Text>
</TouchableOpacity>

export default ActionButton
