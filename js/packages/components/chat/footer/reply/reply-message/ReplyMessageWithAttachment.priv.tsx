import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { getMediaTypeFromMedias } from '@berty/utils/messenger/media'

import { ActiveReplyInteractionProps } from '../interface'

export const ReplyMessageWithAttachmentPriv: React.FC<ActiveReplyInteractionProps> = ({
	activeReplyInteraction,
}) => {
	const { t } = useTranslation()
	const { text } = useStyles()

	return (
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
	)
}

const styles = StyleSheet.create({
	attachmentContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
	icon: { marginTop: 4 },
	attachmentMessage: { lineHeight: 17, marginLeft: 10 },
})
