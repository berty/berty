import { View } from 'react-native'
import { createIconSetFromFontello } from 'react-native-vector-icons'
import IconAwesome from 'react-native-vector-icons/dist/FontAwesome'
import IconFeather from 'react-native-vector-icons/dist/Feather'
import IconMatCom from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import React from 'react'

import { colors } from '../../constants'
import fontelloConfig from '../../static/svg/config.json'
const IconBerty = createIconSetFromFontello(fontelloConfig)

const Icon = ({ name, color, rotate, src, style, flip, ...props }) => {
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
      {
        transform: [
          { scaleX: typeof flip === 'boolean' && flip ? -1 : 1 },
          { rotate: typeof rotate === 'boolean' && rotate ? '90deg' : `${rotate || 0}deg` },
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
    case 'berty':
      return <IconBerty {...iconProps} />
    default:
      return <IconFeather {...iconProps} name={name} />
  }
}

export default Icon

const IconBadge = props => (
  <View>
    <Icon {...props} />
    {props.badge !== undefined &&
    props.badge !== null &&
    props.badge !== '' &&
    props.badge !== 0 ? (
        <View
          style={{
            position: 'absolute',
            right: -8,
            top: -5,
            backgroundColor: colors.red,
            borderRadius: 9,
            width: 18,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      ) : null}
  </View>
)

Icon.Badge = IconBadge
