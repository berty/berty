// @flow

import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { Icon } from '../utils'
import { largeText, margin } from '../styles'

const HeaderButton = ({ icon, onPress }) => {
  return (
    <TouchableOpacity disabled={onPress == null} onPress={onPress}>
      <Icon
        name={icon}
        style={[largeText, margin, { opacity: onPress == null ? 0.5 : 1 }]}
      />
    </TouchableOpacity>
  )
}

export default HeaderButton
