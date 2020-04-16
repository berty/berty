import React from 'react'
import Fingerprint from './custom-icons-svgs/fingerprint.svg'
import QRIcon from './custom-icons-svgs/qr.svg'
import { SvgProps } from 'react-native-svg'

const iconsMap: { [key: string]: React.FC<SvgProps> } = {
	fingerprint: Fingerprint,
	qr: QRIcon,
}

const CustomIcon: React.FC<{
	name: string
	width: number
	height: number
	fill: string
	style: any
}> = ({ name, width, height, fill, style = [] }) => {
	const Icon = iconsMap[name]
	if (!Icon) {
		return null
	}
	return <Icon width={width} height={height} fill={fill} style={style} />
}

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
