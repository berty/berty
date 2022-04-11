import React from 'react'
import Icon from 'react-native-vector-icons/Feather'

const FeatherIcon: React.FC<{
	name: string
	width: number
	height: number
	fill: string
	style: any
}> = ({ name, width, height, fill, style = [] }) => {
	return <Icon name={name} size={width || height} color={fill} style={style} />
}

const IconProvider = (name: string) => ({
	toReactElement: (props: any) => FeatherIcon({ name, ...props }),
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

export const FeatherIconsPack = {
	name: 'feather',
	icons: createIconsMap(),
}
