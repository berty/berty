import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useAppSelector } from '@berty/hooks'
import { selectActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'
import { getMediaTypeFromMedias } from '@berty/utils/messenger/media'

import { UnifiedText } from '../../../shared-components/UnifiedText'
import { ReplyMessageProps } from './interface'

export const ReplyMessage: React.FC<ReplyMessageProps> = ({ convPK }) => {
	const { t } = useTranslation()
	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)
	const { text } = useStyles()

	return (
		<>
			{activeReplyInteraction?.payload?.body ? (
				<UnifiedText
					numberOfLines={1}
					style={[text.size.small, styles.message, { color: activeReplyInteraction?.textColor }]}
				>
					{activeReplyInteraction?.payload?.body}
				</UnifiedText>
			) : (
				<View style={styles.attachmentContainer}>
					<Icon
						name='attach-outline'
						height={15}
						width={15}
						fill={activeReplyInteraction?.textColor}
						style={styles.icon}
					/>
					<UnifiedText
						numberOfLines={1}
						style={[
							text.size.small,
							styles.attachmentMessage,
							{ color: activeReplyInteraction?.textColor },
						]}
					>
						{/* Ignore check for i18n missing keys
							chat.shared-medias.file
							chat.shared-medias.picture
							chat.shared-medias.audio
						*/}
						{t(`chat.shared-medias.${getMediaTypeFromMedias(activeReplyInteraction?.medias)}`)}
					</UnifiedText>
				</View>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	message: { lineHeight: 17 },
	attachmentContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
	icon: { marginTop: 4 },
	attachmentMessage: { lineHeight: 17, marginLeft: 10 },
})
