import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

interface ConfirmDialogProps {
	visible: boolean
	title: string
	message: string
	confirmLabel: string
	cancelLabel: string
	onConfirm: () => void
	onCancel: () => void
	testID?: string
}

// Small confirmation dialog that follows the Berty theme (the native Alert does not)
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	visible,
	title,
	message,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
	testID,
}) => {
	const colors = useThemeColor()

	return (
		<Modal
			transparent
			animationType='fade'
			visible={visible}
			onRequestClose={onCancel}
			statusBarTranslucent
		>
			<Pressable style={styles.backdrop} onPress={onCancel} testID={testID}>
				{/* the inner Pressable stops taps on the card from closing the dialog */}
				<Pressable
					style={[styles.card, { backgroundColor: colors['main-background'] }]}
					onPress={() => {}}
				>
					<Text style={[styles.title, { color: colors['main-text'] }]}>{title}</Text>
					<Text style={[styles.message, { color: colors['secondary-text'] }]}>{message}</Text>
					<View style={styles.buttons}>
						<Pressable
							style={[styles.button, { backgroundColor: colors['input-background'] }]}
							onPress={onCancel}
						>
							<Text style={[styles.buttonText, { color: colors['main-text'] }]}>{cancelLabel}</Text>
						</Pressable>
						<Pressable
							style={[styles.button, { backgroundColor: colors['warning-asset'] }]}
							onPress={onConfirm}
						>
							<Text style={[styles.buttonText, { color: colors['reverted-main-text'] }]}>
								{confirmLabel}
							</Text>
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	card: {
		borderRadius: 20,
		padding: 24,
	},
	title: {
		fontFamily: 'Open Sans',
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 8,
	},
	message: {
		fontFamily: 'Open Sans',
		fontSize: 15,
		lineHeight: 21,
		marginBottom: 24,
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	button: {
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 18,
		marginLeft: 10,
	},
	buttonText: {
		fontFamily: 'Open Sans',
		fontSize: 15,
		fontWeight: '600',
	},
})
