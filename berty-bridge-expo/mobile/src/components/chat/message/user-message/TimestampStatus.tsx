import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { ParsedInteraction } from '@berty/utils/api'
import { pbDateToNum, timeFormat } from '@berty/utils/convert/time'
import { Maybe } from '@berty/utils/type/maybe'

const useStylesMessage = () => {
	const { text, padding } = useStyles()
	const colors = useThemeColor()
	return {
		dateMessage: [text.size.tiny, text.light, { color: colors['secondary-text'] }],
		stateMessageValueMe: [
			padding.left.scale(1.5),
			text.size.tiny,
			{ color: colors['background-header'] },
		],
	}
}

export const TimestampStatus: React.FC<{
	inte: ParsedInteraction
	lastInte: Maybe<ParsedInteraction>
	isFollowedMessage: boolean | undefined
	cmd: any
}> = ({ inte, lastInte, isFollowedMessage, cmd }) => {
	const sentDate = pbDateToNum(inte.sentDate)
	const { row, margin, padding, flex } = useStyles()
	const colors = useThemeColor()
	const styles = useStylesMessage()
	const { t } = useTranslation()

	return (
		<View
			style={[
				row.left,
				flex.align.center,
				margin.top.tiny,
				margin.bottom.tiny,
				inte.isMine && row.item.bottom,
			]}
		>
			<UnifiedText style={[styles.dateMessage, isFollowedMessage && margin.left.scale(35)]}>
				{sentDate > 0 ? timeFormat.fmtTimestamp3(sentDate) : ''}
			</UnifiedText>
			{!cmd && lastInte?.cid === inte.cid && (
				<>
					{inte.isMine && (
						<Icon
							name={inte.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
							width={12}
							height={12}
							fill={colors['background-header']}
							style={[padding.left.tiny, { marginTop: 1 }]}
						/>
					)}
					{inte.isMine && (
						<UnifiedText style={styles.stateMessageValueMe}>
							{t(inte.acknowledged ? 'chat.sent' : 'chat.sending').toLowerCase()}
						</UnifiedText>
					)}
				</>
			)}
		</View>
	)
}
