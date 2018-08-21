// @flow

import React, { Component } from 'react'
import { Grid } from './Grid'
import { StyleSheet, Dimensions } from 'react-native'
import { screen } from '../constants'

export type ScreenState = {
  dimensions: { width: number, height: number },
  orientation: 'portrait' | 'landscape'
}

export type ScreenProps = {
  absolute: boolean,
  style?: Object,
  onResize?: ScreenState => any
}

export default class Screen extends Component<ScreenProps, ScreenState> {
  state = {
    dimensions: {
      width: screen.dimensions.width,
      height: screen.dimensions.height
    },
    orientation: screen.orientation
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
          orientation: width < height ? 'portrait' : 'landscape'
        },
        () => {
          this.props.onResize && this.props.onResize(this.state)
        }
      )
    }
  }

  render = () => {
    const { absolute, style, onResize, ...props } = this.props
    const { dimensions } = this.state
    return (
      <Grid
        flex={1}
        onLayout={this._onLayout}
        justifyContent='flex-start'
        {...props}
        style={[dimensions, style, absolute && StyleSheet.absoluteFill]}
      />
    )
  }
}
