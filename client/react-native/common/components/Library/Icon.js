import React from 'react'
import IconFeather from 'react-native-vector-icons/dist/Feather'
import IconAwesome from 'react-native-vector-icons/dist/FontAwesome'
import IconMatCom from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import { colors } from '../constants'

const Icon = ({ name, color, rotate, style, ...props }: { name: String }) => {
  if (name == null) return null
  const [type, iconName] = [
    name.split('-', 1)[0],
    name
      .split('-')
      .splice(1)
      .join('-'),
  ]
  const iconProps = {
    name: iconName,
    color: color || colors.textGrey,
    style: [
      { color: color || colors.textGrey },
      rotate && {
        transform: [
          { rotate: typeof rotate === 'boolean' ? '90deg' : `${rotate}deg` },
        ],
      },
      style,
    ],
    ...props,
  }
  switch (type) {
    case 'feather':
      return <IconFeather {...iconProps} />
    case 'awesome':
      return <IconAwesome {...iconProps} />
    case 'material':
      return <IconMatCom {...iconProps} />
    default:
      return <IconFeather {...iconProps} name={name} />
  }
}

export default Icon
