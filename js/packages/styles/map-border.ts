import mem from 'mem'
import { StyleSheet, Platform } from 'react-native'
import { Declaration, Sizes } from './types'
import { scaleSize } from './constant'
import { mapSizes, mapBorderSidesSizes } from './map-sides'
import { mapColorsDeclaration } from './map-colors'

export const mapBorderRadiusSides = (decl: Declaration) => ({
	top: mapSizes(decl.sides, (radius) => ({
		borderTopLeftRadius: radius,
		borderTopRightRadius: radius,
	})),
	left: mapSizes(decl.sides, (radius) => ({
		borderTopLeftRadius: radius,
		borderBottomLeftRadius: radius,
	})),
	right: mapSizes(decl.sides, (radius) => ({
		borderTopRightRadius: radius,
		borderBottomRightRadius: radius,
	})),
	bottom: mapSizes(decl.sides, (radius) => ({
		borderBottomLeftRadius: radius,
		borderBottomRightRadius: radius,
	})),
	vertical: mapSizes(decl.sides, (radius) => ({ borderRadius: radius })),
	horizontal: mapSizes(decl.sides, (radius) => ({ borderRadius: radius })),
})

export const mapBorderShadowIOS = (
	decl: Declaration,
	_defaultValues = {
		shadowOpacity: 0.2,
	},
): Sizes<{}> => ({
	...StyleSheet.create({
		tiny: { ..._defaultValues, shadowRadius: 0.5, shadowOffset: { width: 0, height: 0.25 } },
		small: { ..._defaultValues, shadowRadius: 1, shadowOffset: { width: 0, height: 0.5 } },
		medium: { ..._defaultValues, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
		large: { ..._defaultValues, shadowRadius: 5, shadowOffset: { width: 0, height: 2.5 } },
		big: { ..._defaultValues, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
		huge: { ..._defaultValues, shadowRadius: 13, shadowOffset: { width: 0, height: 6.5 } },
	}),
	scale: mem(
		(size: number) =>
			StyleSheet.create({
				scale: {
					..._defaultValues,
					shadowRadius: size,
					shadowOffset: { width: 0, height: size / 2 },
				},
			}).scale,
	),
})

export const mapBorderShadowAndroid = (): Sizes<{}> => ({
	...StyleSheet.create({
		tiny: { elevation: 1 },
		medium: { elevation: 2 },
		small: { elevation: 3 },
		large: { elevation: 4 },
		big: { elevation: 5 },
		huge: { elevation: 6 },
	}),
	scale: mem((size: number) => StyleSheet.create({ scale: { elevation: size } }).scale),
})

export const mapBorder = (decl: Declaration) => ({
	...mapBorderSidesSizes(),
	scale: mem(
		(size: number) => StyleSheet.create({ scale: { borderWidth: size * scaleSize } }).scale,
	),
	radius: {
		...mapSizes(decl.sides, (radius) => ({
			borderRadius: radius,
		})),
		...mapBorderRadiusSides(decl),
	},
	shadow: Platform.select({ ios: mapBorderShadowIOS(decl), android: mapBorderShadowAndroid() }),
	size: StyleSheet.create({}),
	color: mapColorsDeclaration(decl.colors, (v) => ({ borderColor: v })),
})
