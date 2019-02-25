import React from 'react'
import LottieView from 'lottie-react-native'

export default ({ onFinish }) => (
  <LottieView
    source={require('../../static/animation/BertyAnimation.json')}
    autoPlay
    loop={false}
    onAnimationFinish={onFinish}
    style={{ width: 320 }}
    autoSize
  />
)
