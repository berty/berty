import LottieView from 'lottie-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useAppDispatch, useConversationMembers, useMessengerClient } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { getPeerFromMemberPK, PeerNetworkStatus } from '@berty/redux/reducers/messenger.reducer'

import { Avatars } from './Avatars'
import { Boosted } from './Boosted'
import { MemberBarItem } from './interfaces'

interface MemberBarProps {
	convId: string
}

export const MemberBar: React.FC<MemberBarProps> = props => {
	const navigation = useNavigation()
	const [animationStep, setAnimationStep] = useState(0)
	const messengerClient = useMessengerClient()
	const members = useConversationMembers(props.convId).filter(members => !members.isMe)
	const dispatch = useAppDispatch()

	const [memberList, setMemberList] = useState<MemberBarItem[] | undefined>(undefined)

	const handleMemberList = useCallback(async () => {
		const list: MemberBarItem[] = []

		if (!messengerClient) {
			return
		}

		for (const member of members) {
			const peer = await dispatch(
				getPeerFromMemberPK({ memberPK: member.publicKey, convPK: props.convId }),
			)

			list.push({
				networkStatus: peer.payload as PeerNetworkStatus,
				publicKey: member.publicKey ?? undefined,
			})
			if (list.length >= 5) {
				break
			}
		}
		setMemberList(list)
		// members is needed but cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, messengerClient, props.convId])

	useEffect(() => {
		handleMemberList().then()
	}, [handleMemberList])

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
				{animationStep === 2 && memberList !== undefined && (
					<Avatars convId={props.convId} membersLength={members.length} memberList={memberList} />
				)}
			</View>
			<Boosted />
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 10,
		backgroundColor: 'white',
		borderRadius: 18,
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
		alignItems: 'center',
	},
	lottieWidth: {
		height: 8,
	},
})
