import React, { useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { UserMessageBoxProps } from '../interfaces'
import { AudioMessage } from './AudioMessage'
import { FileMessage } from './FileMessage'
import { HyperlinkUserMessage } from './HyperlinkUserMessage'
import { PictureMessage } from './PictureMessage'

const AVATAR_SIZE = 30
const AVATAR_SPACE_RIGHT = 5

export const UserMessageBox: React.FC<UserMessageBoxProps> = ({
	inte,
	setMessageLayoutWidth,
	setIsMenuVisible,
	highlightCid,
	isFollowedMessage,
	previousMessage,
	nextMessage,
	msgBorderColor,
	msgBackgroundColor,
	msgTextColor,
}) => {
	const { margin } = useStyles()

	const isHighlight = highlightCid === inte.cid

	const togglePopover = useCallback(() => {
		if (inte.isMine) {
			return
		}
		setIsMenuVisible(true)
	}, [setIsMenuVisible, inte.isMine])

	return (
		<TouchableOpacity
			onLayout={event => setMessageLayoutWidth(event.nativeEvent.layout.width)}
			disabled={inte.isMine}
			activeOpacity={0.9}
			onLongPress={togglePopover}
			style={{ marginBottom: inte?.reactions?.length ? 10 : 0 }}
		>
			<>
				{!!inte.medias?.length && (
					<View
						style={[
							isFollowedMessage && {
								marginLeft: AVATAR_SIZE + AVATAR_SPACE_RIGHT,
							},
							previousMessage?.medias?.[0]?.mimeType ? margin.top.tiny : margin.top.small,
							nextMessage?.medias?.[0]?.mimeType ? margin.bottom.tiny : margin.bottom.small,
						]}
					>
						{(() => {
							if (inte.medias[0]?.mimeType?.startsWith('image')) {
								return (
									<PictureMessage
										medias={inte.medias}
										onLongPress={togglePopover}
										isHighlight={isHighlight}
									/>
								)
							} else if (inte.medias[0]?.mimeType?.startsWith('audio')) {
								return (
									<AudioMessage
										medias={inte.medias}
										onLongPress={togglePopover}
										isHighlight={isHighlight}
										isMine={!!inte.isMine}
									/>
								)
							} else {
								return (
									<FileMessage
										medias={inte.medias}
										onLongPress={togglePopover}
										isHighlight={isHighlight}
									/>
								)
							}
						})()}
					</View>
				)}
				{!!(!inte.medias?.length || inte.payload?.body) && (
					<HyperlinkUserMessage
						inte={inte}
						msgBorderColor={msgBorderColor}
						isFollowedMessage={isFollowedMessage}
						msgBackgroundColor={msgBackgroundColor}
						msgTextColor={msgTextColor}
						isHighlight={isHighlight}
					/>
				)}
			</>
		</TouchableOpacity>
	)
}
