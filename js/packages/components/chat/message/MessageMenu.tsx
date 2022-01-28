import { berty } from '@berty-tech/api/root.pb'
import { getEmojiByName } from '@berty-tech/components/utils'
import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import React, { createRef, FC, useEffect, useState } from 'react'
import { Modal, Text, View } from 'react-native'
import {
	ScrollView,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import { useReplyReaction } from '../ReplyReactionContext'

export const MessageMenu: FC<{}> = ({}) => {
	const colors = useThemeColor()
	const [{ padding, border }] = useStyles()

	const {
		activePopoverCid,
		setActivePopoverCid,
		setActiveReplyInte,
		setActiveEmojiKeyboardCid,
		highlightCid,
		setHighlightCid,
	} = useReplyReaction()

	return (
		<Modal
			transparent
			visible={!!activePopoverCid}
			animationType='slide'
			style={{
				position: 'relative',
				flex: 1,
				height: '100%',
			}}
		>
			<View
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					top: 0,
				}}
			>
				<TouchableWithoutFeedback
					onPress={() => console.log('on close')}
					style={{ height: '100%' }}
				/>
			</View>
			<View
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				<View style={{ width: '100%' }}>
					<View
						style={[
							border.radius.top.large,
							border.shadow.big,
							padding.bottom.large,
							{
								backgroundColor: colors['main-background'],
								shadowColor: colors.shadow,
							},
						]}
					>
						<Text>Salut mon pote</Text>
					</View>
				</View>
			</View>
		</Modal>
	)
}
