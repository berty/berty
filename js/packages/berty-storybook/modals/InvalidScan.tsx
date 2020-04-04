import React, { useContext } from 'react'
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import { Text, Icon } from 'react-native-ui-kitten'
import { colors, useStyles } from '@berty-tech/styles'
import { ModalsContext } from '../ModalsProvider'

//
// Scan Invalid
//

// Styles
const useStylesInvalidScan = () => {
	const [{ width, height, border, text, padding, margin }] = useStyles()
	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(50),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
		],
		dismissText: [text.size.scale(17)],
	}
}

const _invalidScanStyles = StyleSheet.create({
	errorText: {
		fontSize: 14,
		fontFamily: 'Courier',
	},
	body: {
		bottom: 78,
	},
})

const InvalidScanHeader: React.FC = () => {
	const [{ background, border, row }] = useStyles()
	const size = 115
	const diff = 30
	return (
		<View
			style={{ display: 'flex', alignItems: 'center', padding: 0, margin: 0, paddingTop: size / 2 }}
		>
			<View
				style={[
					background.white,
					border.shadow.medium,
					{
						display: 'flex',
						justifyContent: 'center',
						borderRadius: size / 2,
						width: size,
						height: size,
						padding: 0,
						margin: 0,
						position: 'absolute',
						top: -(size / 2),
					},
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={size - diff}
					height={size - diff}
					fill={colors.red}
					style={[row.item.justify, { padding: 0, margin: 0 }]}
				/>
			</View>
		</View>
	)
}

const InvalidScanError: React.FC<{ error: string }> = ({ error }) => {
	const [{ border, background, padding, margin, text }] = useStyles()

	return (
		<View style={[border.radius.medium, background.light.red, padding.medium, margin.top.huge]}>
			<Text
				style={[text.color.red, text.align.center, text.bold.medium, _invalidScanStyles.errorText]}
			>
				{error}
			</Text>
		</View>
	)
}

const InvalidScanDismissButton: React.FC = () => {
	const _styles = useStylesInvalidScan()
	const [{ row, margin, color, padding, text }] = useStyles()
	const modals = useContext(ModalsContext)

	return (
		<View style={row.center}>
			<TouchableOpacity
				onPress={() => modals.setCurrent()}
				style={[row.fill, _styles.dismissButton, margin.top.huge]}
			>
				<Icon name='close' width={30} height={30} fill={color.grey} style={row.item.justify} />
				<Text style={[text.color.grey, padding.left.small, row.item.justify, _styles.dismissText]}>
					DISMISS
				</Text>
			</TouchableOpacity>
		</View>
	)
}

const InvalidScanBody: React.FC<{ title: string; error: string }> = ({ title, error }) => {
	const [{ background, padding, border, text, margin }] = useStyles()
	return (
		<View style={[background.white, padding.huge, { paddingTop: 0 }, border.radius.large]}>
			<InvalidScanHeader />
			<View>
				<Text style={[text.color.red, text.bold.medium, text.align.center, margin.top.large]}>
					{title}
				</Text>
			</View>
			<InvalidScanError error={error} />
			<InvalidScanDismissButton />
		</View>
	)
}

export const InvalidScan: React.FC<{ error: string; title: string }> = ({ title, error }) => (
	<Modal animationType='slide' transparent visible>
		<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
		<View
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				height: '100%',
			}}
		>
			<InvalidScanBody title={title} error={error} />
		</View>
	</Modal>
)
