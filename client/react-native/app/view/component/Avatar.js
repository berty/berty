import React from 'react'
import { Text, View } from 'react-native'
import {
  blue,
  blue25,
  green,
  green25,
  pink,
  pink25,
  orange,
  orange25,
  purple,
  purple25,
} from '@berty/common/constants/colors'
import { fingerprint } from '@berty/common/helpers/fingerprint'
import { conversation } from '@berty/common/helpers/entity'
import { Store } from '@berty/container'

// From https://fluentcolors.com/
const pastels = [
  { default: blue, light: blue25 },
  { default: green, light: green25 },
  { default: pink, light: pink25 },
  { default: orange, light: orange25 },
  { default: purple, light: purple25 },
]

const Avatar = ({
  id,
  name,
  size = 40,
  margin = 4,
  uri = null,
  style = [],
}) => {
  if (!(style instanceof Array)) {
    style = [style]
  }

  const hexCode = fingerprint(id).substring(0, 16)

  const initials = name
    ? name
        .replace(' ', '')
        .substring(0, 2)
        .toLocaleUpperCase()
    : '?'

  let colorIdx =
    parseInt(hexCode.substring(hexCode.length - 2, hexCode.length), 16) %
    pastels.length

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          margin: margin,
          backgroundColor: pastels[colorIdx].light,
        },
        ...style,
      ]}
    >
      <Text
        style={{
          color: pastels[colorIdx].default,
          paddingTop: size / 4.4,
          fontSize: size / 2.2,
          textAlign: 'center',
        }}
      >
        {initials}
      </Text>
    </View>
  )
}

export const ContactAvatar = ({ data = {}, ...props }) => (
  <Store.Entity.Contact {...data}>
    {({ id, displayName } = data) => (
      <Avatar id={id} name={displayName || id} {...props} />
    )}
  </Store.Entity.Contact>
)
Avatar.Contact = ContactAvatar

export const ConversationAvatar = ({ data = {}, ...props }) =>
  data.kind === 1 ? (
    <ContactAvatar
      data={data.members.find(_ => _.contact.status !== 42)?.contact}
      {...props}
    />
  ) : (
    <Avatar id={data.id} name={conversation.getTitle(data)} {...props} />
  )
Avatar.Conversation = ConversationAvatar

export default Avatar
