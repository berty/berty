/* eslint-disable @typescript-eslint/no-explicit-any */
import Case from 'case'
import { StyleSheet } from 'react-native'
import mem from 'mem'

import { SizesDeclaration, ScaleSizes } from './types'
import { initialScaleSize } from './constant'

const mapSideSize = (type: string, side: string, value: number): any => ({
	[Case.camel(`${type}_${side}`)]: value,
})

const mapSideSizes = (decl: SizesDeclaration<number>, type: string, side: string): any => ({
	...StyleSheet.create({
		tiny: mapSideSize(type, side, decl.tiny),
		small: mapSideSize(type, side, decl.small),
		medium: mapSideSize(type, side, decl.medium),
		large: mapSideSize(type, side, decl.large),
		big: mapSideSize(type, side, decl.big),
		huge: mapSideSize(type, side, decl.huge),
	}),
	scale: mem((size: number) => mapSideSize(type, side, size)),
})

export const mapSides = (decl: SizesDeclaration<number>, type: string): any => ({
	top: mapSideSizes(decl, type, 'top'),
	bottom: mapSideSizes(decl, type, 'bottom'),
	left: mapSideSizes(decl, type, 'left'),
	right: mapSideSizes(decl, type, 'right'),
	vertical: mapSideSizes(decl, type, 'vertical'),
	horizontal: mapSideSizes(decl, type, 'horizontal'),
})

export const mapSizes = (
	decl: SizesDeclaration<number>,
	map: (value: number) => {},
	{ scaleSize }: { scaleSize: ScaleSizes['scaleSize'] },
): any => {
	return {
		...StyleSheet.create({
			tiny: map(decl.tiny),
			small: map(decl.small),
			medium: map(decl.medium),
			large: map(decl.large),
			big: map(decl.big),
			huge: map(decl.huge),
		}),
		scale: mem((radius: number) => {
			return StyleSheet.create({ scale: map(radius * scaleSize) }).scale
		}),
	}
}

export const mapBorderSidesSizes = (
	{ scaleSize = initialScaleSize }: { scaleSize: ScaleSizes['scaleSize'] },
	decl: SizesDeclaration<number>,
): any => ({
	...mapSizes(decl, borderWidth => ({ borderWidth }), { scaleSize }),
	top: mapSizes(decl, borderTopWidth => ({ borderTopWidth }), { scaleSize }),
	left: mapSizes(decl, borderLeftWidth => ({ borderLeftWidth }), { scaleSize }),
	right: mapSizes(decl, borderRightWidth => ({ borderRightWidth }), { scaleSize }),
	bottom: mapSizes(decl, borderBottomWidth => ({ borderBottomWidth }), { scaleSize }),
	horizontal: mapSizes(
		decl,
		borderWidth => ({
			borderLeftWidth: borderWidth,
			borderRightWidth: borderWidth,
		}),
		{ scaleSize },
	),
	vertical: mapSizes(
		decl,
		borderWidth => ({
			borderTopWidth: borderWidth,
			borderBottomWidth: borderWidth,
		}),
		{ scaleSize },
	),
})
