import { StyleSheet } from 'react-native'
import _ from 'lodash'

import { Colors, ColorsDeclaration, ColorsBrightness, ColorsStyles } from './types'

const mapColor = <T extends {}>(v: string, map: (v: string) => T, opacity = '') => map(v + opacity)

const mapColorsDeclarationBasic = <T extends {}>(
	decl: Colors<string>,
	map: (v: string) => T,
	opacity?: string,
): Colors<T> => StyleSheet.create(_.mapValues(decl, v => mapColor(v, map, opacity)))

const mapColorsDeclarationStylesBasic = <T extends {}>(
	decl: ColorsDeclaration,
	map: (value: string) => T,
	opacity?: string,
): Colors<T> & ColorsBrightness<T> => ({
	...mapColorsDeclarationBasic(decl.default, map, opacity),
	default: mapColorsDeclarationBasic(decl.default, map, opacity),
	light: mapColorsDeclarationBasic(decl.light, map, opacity),
	dark: mapColorsDeclarationBasic(decl.dark, map, opacity),
})

export const mapColorsDeclaration = <T extends {}>(
	decl: ColorsDeclaration,
	map: (value: string) => T,
): ColorsStyles<T> => ({
	...mapColorsDeclarationStylesBasic(decl, map),
	transparent: mapColorsDeclarationStylesBasic(decl, map, '20'),
	blur: mapColorsDeclarationStylesBasic(decl, map, '80'),
	opaque: mapColorsDeclarationStylesBasic(decl, map, 'd0'),
})
