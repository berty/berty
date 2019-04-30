import React from 'react'
import { Image as ImageNative } from 'react-native'

const Image = ({ src, style }) => {
  return <ImageNative style={style} source={{ uri: require(src) }} />
}

export default Image
