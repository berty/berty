import React from 'react'
import * as icons from 'lucide-react'

const LucideIcon: React.FC<{
	name: keyof typeof icons
	width: number
	height: number
	fill: string
}> = ({ name, width, height, fill }) => {
	console.log('icon:', icons[name])
	const Icon: any = icons[name]
	return <Icon color={fill} size={width || height} />
}
const IconProvider = (name: string) => ({
	toReactElement: (props: any) => LucideIcon({ name, ...props }),
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

export const LucideIconsPack = {
	name: 'lucide',
	icons: createIconsMap(),
}
