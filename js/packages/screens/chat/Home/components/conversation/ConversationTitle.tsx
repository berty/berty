import React from 'react'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { timeFormat } from '@berty/utils/convert/time'

import { UnreadCount } from '../UnreadCount'

interface ConversationTitleProps {
	unreadCount: number | undefined
	fake: boolean
	displayDate: number | null
	userDisplayName: string
}

export const ConversationTitle: React.FC<ConversationTitleProps> = props => {
	const { padding, flex, text } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[flex.direction.row, flex.justify.start]}>
			{/* Title */}
			<View style={styles.title}>
				<UnifiedText numberOfLines={1}>
					{props.fake ? `FAKE - ${props.userDisplayName}` : props.userDisplayName}
				</UnifiedText>
			</View>

			{/* Timestamp and unread count */}
			<View
				style={[flex.direction.row, flex.align.center, flex.justify.end, { marginLeft: 'auto' }]}
			>
				<>
					<UnreadCount value={props.unreadCount || 0} isConvBadge />
					{props.displayDate && (
						<UnifiedText
							style={[
								padding.left.small,
								text.size.small,
								props.unreadCount ? [text.bold] : { color: colors['secondary-text'] },
							]}
						>
							{timeFormat.fmtTimestamp1(props.displayDate)}
						</UnifiedText>
					)}
				</>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	title: {
		flexShrink: 1,
	},
})
