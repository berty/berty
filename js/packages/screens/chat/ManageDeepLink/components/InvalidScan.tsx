import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty/contexts/styles'
import beapi from '@berty/api'
import { useThemeColor } from '@berty/store'
import { useNavigation } from '@berty/navigation'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

//
// Scan Invalid
//

// Styles
const useStylesInvalidScan = () => {
	const { width, height, border, text, padding, margin } = useStyles()
	const colors = useThemeColor()

	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(50),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			{ borderColor: colors['negative-asset'] },
		],
		dismissText: [text.size.scale(17)],
	}
}

const _invalidScanStyles = StyleSheet.create({
	errorText: {
		fontSize: 14,
		fontFamily: 'Courier, monospace',
	},
	body: {
		bottom: 78,
	},
})

const InvalidScanHeader: React.FC<{ title: string }> = ({ title }) => {
	const _styles = useStylesInvalidScan()
	const { margin, text, border, row, column } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View
				style={[
					border.shadow.medium,
					margin.bottom.medium,
					row.item.justify,
					column.justify,
					_styles.header,
					{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={100}
					height={100}
					fill={colors['warning-asset']}
					style={[row.item.justify]}
				/>
			</View>
			<View>
				<UnifiedText style={[text.bold, text.align.center, { color: colors['warning-asset'] }]}>
					{title}
				</UnifiedText>
			</View>
		</View>
	)
}

const InvalidScanError: React.FC<{ error: string }> = ({ error }) => {
	const { border, padding, margin, text } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				border.radius.medium,
				padding.medium,
				margin.top.huge,
				{ backgroundColor: `${colors['secondary-background-header']}40` },
			]}
		>
			<UnifiedText
				style={[
					text.align.center,
					text.bold,
					_invalidScanStyles.errorText,
					{ color: colors['secondary-background-header'] },
				]}
			>
				{error}
			</UnifiedText>
		</View>
	)
}

const InvalidScanDismissButton: React.FC = () => {
	const _styles = useStylesInvalidScan()
	const { row, margin, padding } = useStyles()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { t }: any = useTranslation()

	return (
		<View style={row.center}>
			<TouchableOpacity
				style={[row.fill, margin.bottom.medium, _styles.dismissButton]}
				onPress={() => {
					try {
						navigation.goBack()
					} catch (e) {
						console.warn("couldn't go back:", e)
					}
				}}
			>
				<Icon
					name='close'
					width={30}
					height={30}
					fill={colors['secondary-text']}
					style={row.item.justify}
				/>
				<UnifiedText
					style={[
						padding.left.small,
						row.item.justify,
						_styles.dismissText,
						{ color: colors['secondary-text'], textTransform: 'uppercase' },
					]}
				>
					{t('modals.invalid-scan.dismiss-button')}
				</UnifiedText>
			</TouchableOpacity>
		</View>
	)
}

const InvalidScan: React.FC<{ type: string; error: any }> = ({ type, error }) => {
	const [layout, setLayout] = useState<number>()
	const { padding, border } = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	const isContactAlreadyAdded = error?.error?.errorDetails?.codes?.includes(
		beapi.errcode.ErrCode.ErrContactRequestContactAlreadyAdded,
	)
	let errorMessage = error.toString()
	let title = ''
	if (type === 'link') {
		title = t('modals.manage-deep-link.invalid-link')
	} else if (type === 'qr') {
		title = t('modals.manage-deep-link.invalid-qr')
		if (isContactAlreadyAdded) {
			title = t('modals.manage-deep-link.contact-already-added')
			errorMessage = t('modals.manage-deep-link.contact-already-added-message')
		}
	} else {
		title = t('modals.manage-deep-link.error')
	}

	return (
		<View style={[padding.medium, { justifyContent: 'center', height: '100%' }]}>
			<View
				onLayout={e => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					padding.medium,
					border.radius.medium,
					{ backgroundColor: colors['main-background'] },
					layout && { height: layout - 78 },
				]}
			>
				<View style={[_invalidScanStyles.body]}>
					<InvalidScanHeader title={title} />
					<InvalidScanError error={errorMessage} />
					<InvalidScanDismissButton />
				</View>
			</View>
		</View>
	)
}

export default InvalidScan
