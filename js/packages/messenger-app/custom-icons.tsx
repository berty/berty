import React from 'react'

import { SvgProps } from 'react-native-svg'

import Fingerprint from './custom-icons-svgs/fingerprint.svg'
import QRCode from './custom-icons-svgs/qr.svg'
import Share from './custom-icons-svgs/share.svg'
import Id from './custom-icons-svgs/id.svg'
import Bubble from './custom-icons-svgs/bubble.svg'
import Users from './custom-icons-svgs/users.svg'
import UserPlus from './custom-icons-svgs/user-plus.svg'
import Quote from './custom-icons-svgs/quote.svg'
import Earth from './custom-icons-svgs/Earth_.svg'
import Network from './custom-icons-svgs/chart-network-light.svg'
import Plus from './custom-icons-svgs/plus.svg'
import AccountBerty from './custom-icons-svgs/account-berty.svg'
import Tor from './custom-icons-svgs/Tor.svg'
import Berty from './custom-icons-svgs/berty_picto.svg'

const iconsMap: { [key: string]: React.FC<SvgProps> } = {
	fingerprint: Fingerprint,
	qr: QRCode,
	share: Share,
	bubble: Bubble,
	id: Id,
	users: Users,
	'user-plus': UserPlus,
	quote: Quote,
	earth: Earth,
	network: Network,
	tor: Tor,
	berty: Berty,
	plus: Plus,
	'account-berty': AccountBerty,
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
	return <Icon width={width} height={height} color={fill} style={style} />
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
