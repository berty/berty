import React, { Component } from 'react'
import { PanResponder, Animated } from 'react-native'

export default class MovableView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pan: new Animated.ValueXY(),
      disabled: props.disabled,
      xOffset: 0,
      yOffset: 0,
    }

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => !this.state.disabled,
      onMoveShouldSetPanResponderCapture: () => !this.state.disabled,
      onPanResponderGrant: () => {
        this.state.pan.setOffset({
          x: this.state.xOffset,
          y: this.state.yOffset,
        })
        this.props.onDragStart()
      },
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        },
      ]),
      onPanResponderRelease: (e, gestureState) => {
        const xOffset = this.state.xOffset + gestureState.dx
        const yOffset = this.state.yOffset + gestureState.dy
        this.setState({ xOffset, yOffset })
        this.props.onDragEnd()
      },
    })
  }

  componentWillMount() {
    if (typeof this.props.onMove === 'function') {
      this.state.pan.addListener(values => this.props.onMove(values))
    }
  }

  componentWillUnmount() {
    this.state.pan.removeAllListeners()
  }

  changeDisableStatus = () => {
    this.state.setState({
      disabled: !this.state.disabled,
    })
  }

  render() {
    return (
      <Animated.View style={[this.props.style, this.state.pan.getLayout()]}>
        {React.Children.map(this.props.children, child =>
          React.cloneElement(child, {
            panHandlers: this.panResponder.panHandlers,
          })
        )}
      </Animated.View>
    )
  }
}

MovableView.defaultProps = {
  onDragStart: () => {},
  onDragEnd: () => {},
  disabled: false,
}
