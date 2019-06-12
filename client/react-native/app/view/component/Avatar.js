import React from 'react'
import { Image } from 'react-native'
import { fingerprint } from '@berty/common/helpers/fingerprint'

const Avatar = ({ data, size = 40, margin = 4, uri = null, style = [] }) => {
  if (uri !== null) {
    return (
      <Image
        style={[
          { width: size, height: size, borderRadius: size / 2, margin: margin },
          ...style,
        ]}
        source={{
          uri: uri,
        }}
      />
    )
  }

  if (!(style instanceof Array)) {
    style = [style]
  }

  if (!data || !data.id) {
    console.error(['No id provided', data])
    return null
  }

  const extractedPublicKey = data.id

  const hexCode = fingerprint(extractedPublicKey || data.id).substring(0, 16)
  const retinaMode = 2

  return (
    <Image
      style={[
        { width: size, height: size, borderRadius: size / 2, margin: margin },
        ...style,
      ]}
      source={{
        uri: `https://api.adorable.io/avatars/${size *
          retinaMode}/${hexCode}.png`,
      }}
    />
  )
}

export default Avatar
