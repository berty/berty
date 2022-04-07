import React from 'react'
import { Platform } from 'react-native'
import { createIconSet } from 'react-native-vector-icons'

import glyphMap from '@berty/assets/font/CustomIcons.gen.json'
import iconFont from '@berty/assets/font/CustomIcons.gen.ttf'

// fix random icons on web
if (Platform.OS === 'web') {
	// generate font
	const iconFontStyles = `@font-face {
		src: url(${iconFont});
		font-family: CustomIcons;
	}`

	// create stylesheet
	const style = document.createElement('style')
	style.appendChild(document.createTextNode(iconFontStyles))

	// inject stylesheet
	document.head.appendChild(style)
}

const parsedGlyphMap: Record<string, number> = {}
for (const key in glyphMap) {
	parsedGlyphMap[key] = Number((glyphMap as Record<string, string>)[key].replace(/\\/g, '0x'))
}

const Icon = createIconSet(parsedGlyphMap, 'Custom Icons')

const CustomIcon: React.FC<{
	name: string
	width: number
	height: number
	fill: string
	style: any
}> = ({ name, width, fill, style = [] }) => (
	<Icon name={name} size={width} color={fill} style={style} />
)

const IconProvider = (name: string) => ({
	toReactElement: (props: any) => CustomIcon({ name, ...props }),
})

function createIconsMap() {
	return new Proxy(
		{},
		{
			get(_, name: string) {
				return IconProvider(name)
			},
		},
	)
}

export const CustomIconsPack = {
	name: 'custom',
	icons: createIconsMap(),
}
