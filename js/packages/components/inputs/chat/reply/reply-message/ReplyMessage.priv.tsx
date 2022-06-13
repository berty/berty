import React from 'react'
import { StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { UnifiedText } from '../../../../shared-components/UnifiedText'
import { ActiveReplyInteractionProps } from '../interface'

export const ReplyMessage: React.FC<ActiveReplyInteractionProps> = ({ activeReplyInteraction }) => {
	const { text } = useStyles()

	return (
		<UnifiedText
			numberOfLines={1}
			style={[text.size.small, styles.message, { color: activeReplyInteraction?.textColor }]}
		>
			{activeReplyInteraction?.payload?.body}
		</UnifiedText>
	)
}

const styles = StyleSheet.create({ message: { lineHeight: 17 } })
