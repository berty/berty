import React from 'react'
import LottieView from 'lottie-react-native'

const Animation = ({ onFinish }) => (
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
