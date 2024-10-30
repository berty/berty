import { Icon } from '@ui-kitten/components'
import React, { useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useMessengerClient, useThemeColor } from '@berty/hooks'

interface HeaderTitleProps {
	conv?: beapi.messenger.IConversation
}

export const HeaderTitle: React.FC<HeaderTitleProps> = props => {
	const { border, padding, text } = useStyles()
	const colors = useThemeColor()

	const [editValue, setEditValue] = useState(props.conv?.displayName || '')
	const [isEdit, setIsEdit] = useState(false)

	const client = useMessengerClient()

	const editDisplayName = async () => {
		const buf = beapi.messenger.AppMessage.SetGroupInfo.encode({ displayName: editValue }).finish()
		await client?.interact({
			conversationPublicKey: props.conv?.publicKey,
			type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo,
			payload: buf,
			metadata: true,
		})
		setIsEdit(false)
	}

	if (isEdit) {
		return (
			<View
				style={[
					border.radius.small,
					padding.horizontal.small,
					{
						width: '70%',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						backgroundColor: colors['input-background'],
					},
				]}
			>
				<TextInput
					style={[
						text.align.center,
						text.bold,
						text.size.scale(20),
						padding.vertical.small,
						{ color: colors['main-text'] },
					]}
					autoFocus
					onSubmitEditing={editDisplayName}
					onBlur={() => {
						setIsEdit(false)
						setEditValue(props.conv?.displayName || '')
					}}
					value={editValue}
					onChange={({ nativeEvent }) => setEditValue(nativeEvent.text)}
					testID={editValue}
				/>
				<TouchableOpacity onPress={editDisplayName}>
					<Icon name='checkmark-outline' height={25} width={25} fill={colors['secondary-text']} />
				</TouchableOpacity>
			</View>
		)
	}
	return (
		<TouchableOpacity activeOpacity={1} onLongPress={() => setIsEdit(true)}>
			<UnifiedText numberOfLines={1} style={[text.align.center, text.size.large, text.bold]}>
				{props.conv?.displayName || ''}
			</UnifiedText>
		</TouchableOpacity>
	)
}
