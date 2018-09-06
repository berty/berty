import React, { Component } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import { screen } from '../../constants'

export default class Screen extends Component {
  state = {
    dimensions: {
      width: screen.dimensions.width,
      height: screen.dimensions.height,
    },
    orientation: screen.orientation,
  }

  _dimensions = screen.dimensions

  _onLayout = () => {
    const { width, height } = Dimensions.get('window')

    if (
      this.state.dimensions.width !== width ||
      this.state.dimensions.height !== height
    ) {
      // this._dimensions = { width, height }
      // this._orientation = width < height ? 'portrait' : 'landscape'
      this.setState(
        {
          dimensions: { width, height },
          orientation: width < height ? 'portrait' : 'landscape',
        },
        () => {
          this.props.onResize && this.props.onResize(this.state)
        }
      )
    }
  }

  render () {
    const { absolute, style, onResize, ...props } = this.props
    const { dimensions } = this.state
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'flex-start',
          },
          dimensions,
          style,
          absolute && StyleSheet.absoluteFill,
        ]}
        onLayout={this._onLayout}
        {...props}
      />
    )
  }
}
