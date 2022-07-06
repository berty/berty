import LottieView from 'lottie-react-native'
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { useConversationMembers } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'

import { Avatars } from './Avatars'
import { Boosted } from './Boosted'

export const MemberBar = ({ convId }: { convId: string }) => {
	const navigation = useNavigation()
	const [animationStep, setAnimationStep] = useState(0)
	const members = useConversationMembers(convId).filter(members => !members.isMe)

	return (
		<TouchableOpacity
			onPress={() => navigation.navigate('Group.MultiMemberSettings', { convId })}
			style={{
				backgroundColor: 'white',
				borderRadius: 18,
				left: 20,
				right: 20,
				zIndex: 10,
				position: 'absolute',
				shadowOffset: {
					width: 0,
					height: 8,
				},
				shadowColor: 'black',
				shadowOpacity: 0.1,
				shadowRadius: 20,
				elevation: 12,
				flexDirection: 'row',
				alignItems: 'center',
				height: 40,
			}}
		>
			{/* <View style={{ width: 28 }} /> */}
			<View style={{ width: '90%' }}>
				{animationStep === 0 && (
					<LottieView
						autoPlay
						style={{ width: '100%' }}
						source={require('@berty/assets/lottie/member_bar-lottie/anim_orange.json')}
						onAnimationFinish={() => {
							console.log('ok')
							setAnimationStep(1)
						}}
						loop={false}
					/>
				)}
				{animationStep === 1 && (
					<LottieView
						autoPlay
						style={{ width: '100%' }}
						source={require('@berty/assets/lottie/member_bar-lottie/anim_blue.json')}
						onAnimationFinish={() => {
							setAnimationStep(2)
						}}
						loop={false}
					/>
				)}
				{animationStep === 2 && (
					<Avatars
						convId={convId}
						items={members.map(member => ({
							status: 'connected',
							publicKey: member.publicKey ?? undefined,
						}))}
						// items={[
						// 	{ status: 'connected' },
						// 	{ status: 'disconnected' },
						// 	{ status: 'reconnecting' },
						// 	{ status: 'connected' },
						// 	{ status: 'connected' },
						// 	{ status: 'disconnected' },
						// ]}
					/>
				)}
			</View>
			<Boosted />
		</TouchableOpacity>
	)
}
