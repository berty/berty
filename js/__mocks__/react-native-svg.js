// https://github.com/FormidableLabs/react-native-svg-mock
import React from 'react'

const createComponent = function (name) {
	return class extends React.Component {
		// overwrite the displayName, since this is a class created dynamically
		static displayName = name

		render() {
			const { children, ...props } = this.props
			return React.createElement(name, props)
		}
	}
}

// Mock all react-native-svg exports
// from https://github.com/magicismight/react-native-svg/blob/master/index.js
const Svg = createComponent('RNSVGMock')
const Circle = createComponent('RNSVGCircle')
const Ellipse = createComponent('RNSVGEllipse')
const G = createComponent('RNSVGG')
const Text = createComponent('RNSVGText')
const TextPath = createComponent('RNSVGTextPath')
const TSpan = createComponent('RNSVGTSpan')
const Path = createComponent('RNSVGPath')
const Polygon = createComponent('RNSVGPolygon')
const Polyline = createComponent('RNSVGPolyline')
const Line = createComponent('RNSVGLine')
const Rect = createComponent('RNSVGRect')
const Use = createComponent('RNSVGUse')
const Image = createComponent('RNSVGImage')
const Symbol = createComponent('RNSVGSymbol')
const Defs = createComponent('RNSVGDefs')
const LinearGradient = createComponent('RNSVGLinearGradient')
const RadialGradient = createComponent('RNSVGRadialGradient')
const Stop = createComponent('RNSVGStop')
const ClipPath = createComponent('RNSVGClipPath')
const Pattern = createComponent('RNSVGPattern')
const Mask = createComponent('RNSVGMask')

export {
	Svg,
	Circle,
	Ellipse,
	G,
	Text,
	TextPath,
	TSpan,
	Path,
	Polygon,
	Polyline,
	Line,
	Rect,
	Use,
	Image,
	Symbol,
	Defs,
	LinearGradient,
	RadialGradient,
	Stop,
	ClipPath,
	Pattern,
	Mask,
}

export default Svg
