import React from 'react'
import { View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

interface SenderNameProps {
	name: string
	isFollowedMessage: boolean
	msgSenderColor: string | undefined
}

export const SenderName: React.FC<SenderNameProps> = ({
	name,
	isFollowedMessage,
	msgSenderColor,
}) => {
	const { text, margin } = useStyles()

	return (
		<View style={[isFollowedMessage && margin.left.scale(40)]}>
			<UnifiedText
				style={[text.bold, margin.bottom.tiny, text.size.tiny, { color: msgSenderColor }]}
			>
				{name}
			</UnifiedText>
		</View>
	)
}
