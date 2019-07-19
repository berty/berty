import React from 'react'
import { Platform } from 'react-native'
import LottieView from 'lottie-react-native'

const Animation = ({ onFinish }) =>
  // FIXME: fix lottie
  Platform.OS === 'ios' ? null : (
    <LottieView
      source={require('@berty/common/static/animation/BertyAnimation.json')}
      autoPlay
      loop={false}
      onAnimationFinish={onFinish}
      style={{ width: 320 }}
      autoSize
    />
  )

export default Animation
