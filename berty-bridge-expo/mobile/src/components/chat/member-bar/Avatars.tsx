import React from 'react'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

import { AvatarWrapper } from './AvatarWrapper'
import { MemberBarItem } from './interfaces'

const MAX_MEMBERS_TO_SHOW = 5
const WIDTH_AVATAR_WRAPPER = 30

interface AvatarsProps {
	convId: string
	memberList: MemberBarItem[]
	membersLength: number
}

export const Avatars: React.FC<AvatarsProps> = props => {
	return (
		<View style={styles.container}>
			<View style={styles.placeholder} />
			{props.memberList.map((member, index) => (
				<AvatarWrapper
					convId={props.convId}
					member={member}
					index={index}
					key={member.publicKey ?? index}
				/>
			))}
			{props.membersLength > MAX_MEMBERS_TO_SHOW && (
				<View style={styles.manyMembersWrapper}>
					<UnifiedText style={styles.manyMembersText}>
						+{props.membersLength - MAX_MEMBERS_TO_SHOW}
					</UnifiedText>
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
	placeholder: {
		width: WIDTH_AVATAR_WRAPPER,
	},
	manyMembersWrapper: {
		width: WIDTH_AVATAR_WRAPPER,
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
