import React from 'react'
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native'

import { useThemeColor } from '@berty/hooks'

interface AudioWrapperPrivProps {
	onLongPress: () => void
	isMine: boolean
	children: JSX.Element
}

export const AudioWrapperPriv: React.FC<AudioWrapperPrivProps> = ({
	onLongPress,
	isMine,
	children,
}) => {
	const colors = useThemeColor()

	return (
		<View style={styles.container}>
			<View
				style={{
					position: 'absolute',
					bottom: -2,
					[isMine ? 'right' : 'left']: 10,
					transform: [{ rotate: isMine ? '-45deg' : '45deg' }, { scaleX: isMine ? 1 : -1 }],
				}}
			>
				<View style={[styles.topDot, { backgroundColor: colors['background-header'] }]} />
				<View style={[styles.bottomDot, { backgroundColor: colors['main-background'] }]} />
			</View>
			<TouchableWithoutFeedback style={styles.alignCenter} onLongPress={onLongPress}>
				{children}
			</TouchableWithoutFeedback>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		zIndex: 2,
		position: 'relative',
	},
	topDot: {
		position: 'absolute',
		width: 25,
		height: 30,
		bottom: 1,
		borderBottomLeftRadius: 25,
		right: -12,
		zIndex: -1,
	},
	bottomDot: {
		position: 'absolute',
		width: 20,
		height: 35,
		bottom: -6,
		borderBottomLeftRadius: 50,
		right: -16,
		zIndex: -1,
	},
	alignCenter: {
		alignItems: 'center',
	},
})
