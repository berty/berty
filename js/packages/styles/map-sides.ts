import Case from 'case'
import { StyleSheet } from 'react-native'
import mem from 'mem'
import { SizesDeclaration } from './types'
import { scaleSize } from './constant'

export const mapSideSize = (type: string, side: string, value: number) => ({
	[Case.camel(`${type}_${side}`)]: value,
})

export const mapSideSizes = (decl: SizesDeclaration<number>, type: string, side: string) => ({
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

export const mapSides = (decl: SizesDeclaration<number>, type: string) => ({
	top: mapSideSizes(decl, type, 'top'),
	bottom: mapSideSizes(decl, type, 'bottom'),
	left: mapSideSizes(decl, type, 'left'),
	right: mapSideSizes(decl, type, 'right'),
	vertical: mapSideSizes(decl, type, 'vertical'),
	horizontal: mapSideSizes(decl, type, 'horizontal'),
})

export const mapSizes = (decl: SizesDeclaration<number>, map: (value: number) => {}) => ({
	...StyleSheet.create({
		tiny: map(decl.tiny),
		small: map(decl.small),
		medium: map(decl.medium),
		large: map(decl.large),
		big: map(decl.big),
		huge: map(decl.huge),
	}),
	scale: mem((radius: number) => StyleSheet.create({ scale: map(radius * scaleSize) }).scale),
})

export const mapBorderSidesSizes = (
	decl: SizesDeclaration<number> = {
		tiny: 0.1 * scaleSize,
		small: 0.2 * scaleSize,
		medium: 0.5 * scaleSize,
		large: 1 * scaleSize,
		big: 2 * scaleSize,
		huge: 5 * scaleSize,
	},
) => ({
	...mapSizes(decl, (borderWidth) => ({ borderWidth })),
	top: mapSizes(decl, (borderTopWidth) => ({ borderTopWidth })),
	left: mapSizes(decl, (borderLeftWidth) => ({ borderLeftWidth })),
	right: mapSizes(decl, (borderRightWidth) => ({ borderRightWidth })),
	bottom: mapSizes(decl, (borderBottomWidth) => ({ borderBottomWidth })),
	horizontal: mapSizes(decl, (borderWidth) => ({
		borderLeftWidth: borderWidth,
		borderRightWidth: borderWidth,
	})),
	vertical: mapSizes(decl, (borderWidth) => ({
		borderTopWidth: borderWidth,
		borderBottomWidth: borderWidth,
	})),
})
