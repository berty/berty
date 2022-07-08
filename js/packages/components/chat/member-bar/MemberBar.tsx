import LottieView from 'lottie-react-native'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { useNavigation } from '@berty/navigation'

import { Avatars } from './Avatars'
import { Boosted } from './Boosted'

interface MemberBarProps {
	members: beapi.messenger.IMember[]
	convId: string
}

export const MemberBar: React.FC<MemberBarProps> = props => {
	const navigation = useNavigation()
	const [animationStep, setAnimationStep] = useState(0)

	return (
		<TouchableOpacity
			onPress={() => navigation.navigate('Group.MultiMemberSettings', { convId: props.convId })}
			style={styles.container}
		>
			<View style={styles.barWidth}>
				{animationStep === 0 && (
					<LottieView
						autoPlay
						style={styles.lottieWidth}
						source={require('@berty/assets/lottie/network_status_animations/orange.json')}
						onAnimationFinish={() => setAnimationStep(1)}
						loop={false}
					/>
				)}
				{animationStep === 1 && (
					<LottieView
						autoPlay
						style={styles.lottieWidth}
						source={require('@berty/assets/lottie/network_status_animations/blue.json')}
						onAnimationFinish={() => setAnimationStep(2)}
						loop={false}
					/>
				)}
				{animationStep === 2 && (
					<Avatars
						convId={props.convId}
						items={props.members.map(member => ({
							status: 'connected',
							publicKey: member.publicKey ?? undefined,
						}))}
					/>
				)}
			</View>
			<Boosted />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
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
		justifyContent: 'space-between',
		paddingHorizontal: 5,
		height: 40,
	},
	barWidth: {
		flex: 1,
	},
	lottieWidth: {
		width: '100%',
		height: 10,
		marginLeft: 15,
	},
})
