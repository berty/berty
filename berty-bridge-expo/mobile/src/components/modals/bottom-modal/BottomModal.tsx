import React from 'react'
import { Modal, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native'

import { useThemeColor } from '@berty/hooks'

interface BottomModalProps {
	children: React.ReactNode
	isVisible: boolean
	setIsVisible: (val: boolean) => void
}

export const BottomModal: React.FC<BottomModalProps> = ({ children, isVisible, setIsVisible }) => {
	const colors = useThemeColor()

	return (
		<Modal animationType='slide' transparent={true} visible={isVisible}>
			<View style={styles.container}>
				<TouchableOpacity
					style={styles.blur}
					activeOpacity={0}
					onPress={() => setIsVisible(false)}
				/>
				<KeyboardAvoidingView behavior='padding'>
					<View style={{ backgroundColor: colors['main-background'], paddingBottom: 30 }}>
						{children}
					</View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingBottom: 0,
		right: 0,
		left: 0,
	},
	blur: {
		flex: 1,
		elevation: 6,
		zIndex: 6,
	},
})
