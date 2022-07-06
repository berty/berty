import React from 'react'
import { View } from 'react-native'

import { MemberAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const Avatar = ({ convId, publicKey }: { convId: string; publicKey?: string }) => {
	return <MemberAvatar publicKey={publicKey} conversationPublicKey={convId} size={26} />
}

interface AvatarsProps {
	convId: string
	items: { status: 'connected' | 'reconnecting' | 'disconnected'; publicKey?: string }[]
}

export const Avatars: React.FC<AvatarsProps> = props => {
	return (
		<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
			{props.items.slice(0, 5).map((item, index) => {
				let backgroundColor = '#E35179'

				if (item.status === 'connected') {
					backgroundColor = '#0FBE00'
				}
				if (item.status === 'reconnecting') {
					backgroundColor = '#F9B70F'
				}
				return (
					<View
						key={item.publicKey ?? index}
						style={{
							width: 30,
							height: 30,
							borderRadius: 30,
							backgroundColor,
							borderColor: 'white',
							borderWidth: 1,
							justifyContent: 'center',
							alignItems: 'center',
							marginLeft: -10,
							zIndex: index,
						}}
					>
						<Avatar publicKey={item.publicKey} convId={props.convId} />
					</View>
				)
			})}
			{props.items.length > 5 && (
				<View
					style={{
						width: 30,
						height: 30,
						borderRadius: 30,
						backgroundColor: '#EDF1F7',
						justifyContent: 'center',
						alignItems: 'center',
						marginLeft: -10,
						zIndex: -1,
					}}
				>
					<UnifiedText style={{ fontSize: 10 }}>+5</UnifiedText>
				</View>
			)}
		</View>
	)
}
