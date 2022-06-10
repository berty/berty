import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useAppSelector } from '@berty/hooks'
import { selectActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'
import { getMediaTypeFromMedias } from '@berty/utils/messenger/media'

import { UnifiedText } from '../../../shared-components/UnifiedText'
import { ReplyMessageProps } from './interface'

export const ReplyMessage: React.FC<ReplyMessageProps> = ({ convPK }) => {
	const { text } = useStyles()
	const { t } = useTranslation()
	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)

	return (
		<>
			{activeReplyInteraction?.payload?.body ? (
				<UnifiedText
					numberOfLines={1}
					style={[
						text.size.small,
						{
							color: activeReplyInteraction?.textColor,
							lineHeight: 17,
						},
					]}
				>
					{activeReplyInteraction?.payload?.body}
				</UnifiedText>
			) : (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon
						name='attach-outline'
						height={15}
						width={15}
						fill={activeReplyInteraction?.textColor}
						style={{ marginTop: 4 }}
					/>
					<UnifiedText
						numberOfLines={1}
						style={[
							text.size.small,
							{
								color: activeReplyInteraction?.textColor,
								lineHeight: 17,
								marginLeft: 10,
							},
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
