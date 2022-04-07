import React from 'react'
import { SvgProps } from 'react-native-svg'

import Fingerprint from '@berty/assets/custom-icons/fingerprint.svg'
import QRCode from '@berty/assets/custom-icons/qr.svg'
import Share from '@berty/assets/custom-icons/share.svg'

import Users from '@berty/assets/custom-icons/users.svg'
import UserPlus from '@berty/assets/custom-icons/user-plus.svg'
import Quote from '@berty/assets/custom-icons/quote.svg'
import Earth from '@berty/assets/custom-icons/earth.svg'
import Network from '@berty/assets/custom-icons/chart-network-light.svg'
import Berty from '@berty/assets/custom-icons/berty_picto.svg'
import Microphone from '@berty/assets/custom-icons/microphone.svg'
import Play from '@berty/assets/custom-icons/play-player.svg'
import Pause from '@berty/assets/custom-icons/pause-player.svg'
import Camera from '@berty/assets/custom-icons/camera.svg'
import CameraOutline from '@berty/assets/custom-icons/camera-outline.svg'
import Files from '@berty/assets/custom-icons/files.svg'
import Gallery from '@berty/assets/custom-icons/gallery.svg'
import WrongMan from '@berty/assets/custom-icons/wrong-man.svg'
import Privacy from '@berty/assets/custom-icons/privacy.svg'
import MicrophoneFooter from '@berty/assets/custom-icons/microphone-footer.svg'
import Proximity from '@berty/assets/custom-icons/proximity.svg'
import Peer from '@berty/assets/custom-icons/peer.svg'
import Services from '@berty/assets/custom-icons/services.svg'
import ExpertBluetooth from '@berty/assets/custom-icons/expert-bluetooth.svg'
import ExpertSetting from '@berty/assets/custom-icons/expert-mdns.svg'

const iconsMap: { [key: string]: React.FC<SvgProps> } = {
	fingerprint: Fingerprint,
	qr: QRCode,
	share: Share,
	users: Users,
	'user-plus': UserPlus,
	quote: Quote,
	earth: Earth,
	network: Network,
	berty: Berty,
	microphone: Microphone,
	play: Play,
	pause: Pause,
	camera: Camera,
	gallery: Gallery,
	files: Files,
	'camera-outline': CameraOutline,
	'wrong-man': WrongMan,
	privacy: Privacy,
	'microphone-footer': MicrophoneFooter,
	proximity: Proximity,
	peer: Peer,
	services: Services,
	'expert-ble': ExpertBluetooth,
	'expert-setting': ExpertSetting,
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
