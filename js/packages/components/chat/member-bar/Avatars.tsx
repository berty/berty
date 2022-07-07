import React from 'react'
import { StyleSheet, View } from 'react-native'

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
		<View style={styles.container}>
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
						style={[
							styles.avatarWrapper,
							{
								backgroundColor,
								zIndex: index,
							},
						]}
					>
						<Avatar publicKey={item.publicKey} convId={props.convId} />
					</View>
				)
			})}
			{props.items.length > 5 && (
				<View style={styles.manyMembersWrapper}>
					<UnifiedText style={styles.manyMembersText}>+5</UnifiedText>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarWrapper: {
		width: 30,
		height: 30,
		borderRadius: 30,
		borderColor: 'white',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: -10,
	},
	manyMembersWrapper: {
		width: 30,
		height: 30,
		borderRadius: 30,
		backgroundColor: '#EDF1F7',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: -10,
		zIndex: -1,
	},
	manyMembersText: {
		fontSize: 10,
	},
})
