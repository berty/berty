import React from 'react'
import { View, Text } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { getEmojiByName } from '@berty-tech/components/utils'

const emojis = [':+1:', ':heart:', ':ok_hand:', ':sunglasses:', ':joy:']

const Popover: React.FC<{
	onReply: () => void
	onEmojiKeyboard: () => void
	onSelectEmoji: (emoji: string) => void
}> = ({ onReply, onEmojiKeyboard, onSelectEmoji }) => {
	return (
		<View
			style={{
				backgroundColor: '#F7F8FF',
				flexDirection: 'row',
				paddingVertical: 5,
				paddingHorizontal: 10,
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: 100,
				borderWidth: 2,
				borderColor: '#EFF1FA',
			}}
		>
			<Icon
				name='undo'
				fill='#D1D4DE'
				style={{ marginHorizontal: 4 }}
				height={30}
				width={30}
				onPress={onReply}
			/>
			{emojis.map((item) => (
				<Text
					key={item}
					style={{ marginHorizontal: 4, fontSize: 26 }}
					onPress={() => onSelectEmoji(item)}
				>
					{getEmojiByName(item)}
				</Text>
			))}
			<Icon
				name='more-horizontal'
				fill='#D1D4DE'
				style={{ marginHorizontal: 4 }}
				height={40}
				width={40}
				onPress={onEmojiKeyboard}
			/>
		</View>
	)
}

export default Popover
