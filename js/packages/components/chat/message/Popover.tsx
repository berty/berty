import React from 'react'
import { View } from 'react-native'

import { Icon } from '@ui-kitten/components'
import Emoji from 'react-native-emoji'

const emojis = [':+1:', ':heart:', ':ok_hand:', ':sunglasses:', ':joy:']

const Popover: React.FC<{
	onReply: () => void
	onEmojiKeyboard: () => void
	onSelectEmoji: (emoji: string) => void
}> = ({ onReply, onEmojiKeyboard, onSelectEmoji }) => {
	return (
		<View
			style={{
				padding: 20,
				paddingBottom: 40,
				height: 120,
			}}
		>
			<View
				style={{
					backgroundColor: '#F7F8FF',
					flexDirection: 'row',
					paddingVertical: 5,
					paddingHorizontal: 10,
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: 100,
					shadowColor: 'rgba(0,0,0,1)',
					shadowOffset: {
						width: 0,
						height: 10,
					},
					shadowOpacity: 0.27,
					shadowRadius: 10,
					elevation: 6,
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
					<Emoji
						key={item}
						name={item}
						style={{ marginHorizontal: 4, fontSize: 26 }}
						onPress={() => onSelectEmoji(item)}
					/>
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
		</View>
	)
}

export default Popover
