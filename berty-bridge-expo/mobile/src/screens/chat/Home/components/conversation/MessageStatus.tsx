import { Icon } from '@ui-kitten/components'
import React from 'react'
import { ActivityIndicator } from 'react-native'

import beapi from '@berty/api'
import { useThemeColor } from '@berty/hooks'
import { ParsedInteraction } from '@berty/utils/api'

export const MessageStatus: React.FC<{
	interaction: ParsedInteraction
	isAccepted: boolean
	sending?: boolean
}> = React.memo(({ interaction, isAccepted, sending }) => {
	const colors = useThemeColor()

	if (interaction?.type !== beapi.messenger.AppMessage.Type.TypeUserMessage && isAccepted) {
		return null
	}

	return sending ? (
		<ActivityIndicator />
	) : (
		<Icon
			name={
				(interaction && !interaction.acknowledged) || !isAccepted
					? 'navigation-2-outline'
					: 'navigation-2'
			}
			width={14}
			height={14}
			fill={colors['background-header']}
		/>
	)
})
