import React from 'react'
import LottieView from 'lottie-react-native'

export default () => (
  <LottieView
    source={require('../../static/animation/BertyAnimation.json')}
    autoPlay
    loop={false}
    onAnimationFinish={() => this.setState({ showAnim: false })}
    style={{ width: 320 }}
    autoSize
  />
)
