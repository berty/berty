import React from 'react'
import Icon from './Icon'
import colors from '@berty/common/constants/colors'

export const TabIcon = ({ focused, name }) => (
  <Icon name={name} color={focused ? colors.blue : colors.darkGrey} size={20} />
)

export default TabIcon
