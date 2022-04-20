import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { Icon } from '@ui-kitten/components'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	removeMemberFromInvitationListById,
	selectInvitationListMembers,
} from '@berty/redux/reducers/groupCreationForm.reducer'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { ContactAvatar } from '../avatars'
import { UnifiedText } from '../shared-components/UnifiedText'

const MemberItem: React.FC<{
	member: beapi.messenger.IContact
}> = ({ member }) => {
	const { padding, column, text, row, maxWidth, border } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const dispatch = useAppDispatch()

	return (
		<View style={[padding.horizontal.medium, maxWidth(100)]}>
			<View style={[column.top, padding.top.small]}>
				<ContactAvatar size={70 * scaleSize} publicKey={member.publicKey} />
				<UnifiedText
					numberOfLines={1}
					style={[
						column.item.center,
						padding.top.tiny,
						text.bold,
						text.align.center,
						{ color: colors['reverted-main-text'] },
					]}
				>
					{member.displayName}
				</UnifiedText>
			</View>
			<TouchableOpacity
				style={[
					border.shadow.medium,
					border.radius.medium,
					column.justify,
					{
						height: 25 * scaleSize,
						width: 25 * scaleSize,
						position: 'absolute',
						top: 5 * scaleSize,
						right: 9 * scaleSize,
						backgroundColor: colors['main-background'],
						shadowColor: colors.shadow,
					},
				]}
				onPress={() => dispatch(removeMemberFromInvitationListById(member.publicKey!))}
			>
				<Icon
					name='close-outline'
					width={20 * scaleSize}
					height={20 * scaleSize}
					fill={colors['warning-asset']}
					style={row.item.justify}
				/>
			</TouchableOpacity>
		</View>
	)
}

export const MemberList = () => {
	const { padding } = useStyles()
	const members = useAppSelector(selectInvitationListMembers)

	return (
		<View style={{ height: 135 }}>
			<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[padding.left.medium]}
			>
				{members.map(member => (
					<MemberItem key={member.publicKey} member={member} />
				))}
			</ScrollView>
		</View>
	)
}
