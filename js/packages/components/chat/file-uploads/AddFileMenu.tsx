import React, { useState } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import { Text, Icon } from '@ui-kitten/components'

const ListItem: React.FC<{
	title: string
	onPress: () => void
	iconProps: {
		name: string
		fill: string
		height: number
		width: number
		pack?: string
	}
}> = ({ title, iconProps, onPress }) => {
	const [{ padding, margin }] = useStyles()

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[
				padding.vertical.medium,
				padding.horizontal.large,
				{ flexDirection: 'row', alignItems: 'center' },
			]}
		>
			<Icon {...iconProps} />
			<Text style={[margin.left.large]}>{title}</Text>
		</TouchableOpacity>
	)
}

export const AddFileMenu: React.FC<{ close: () => void }> = ({ close }) => {
	const [{ color, border }] = useStyles()
	const { t } = useTranslation()

	const LIST_CONFIG = [
		{
			iconProps: {
				name: 'microphone',
				fill: '#C7C8D8',
				height: 40,
				width: 40,
				pack: 'custom',
			},
			title: t('chat.files.record-sound'),
			onPress: () => {},
		},
		{
			iconProps: {
				name: 'add-picture',
				fill: '#C7C8D8',
				height: 40,
				width: 40,
				pack: 'custom',
			},
			title: t('chat.files.media'),
			onPress: () => {},
		},
		{
			iconProps: {
				name: 'bertyzzz',
				fill: 'white',
				height: 40,
				width: 40,
				pack: 'custom',
			},
			title: t('chat.files.emojis'),
			onPress: () => {},
		},
	]

	return (
		<View
			style={[
				StyleSheet.absoluteFill,
				{
					zIndex: 9,
					elevation: 9,
				},
			]}
		>
			<TouchableOpacity style={{ flex: 1 }} onPress={close}>
				<View></View>
			</TouchableOpacity>
			<View
				style={[
					{
						position: 'absolute',
						bottom: 100,
						left: 0,
						right: 0,
						width: '100%',
						backgroundColor: color.white,
					},
					border.radius.top.large,
					border.shadow.big,
				]}
			>
				{LIST_CONFIG.map((listItem) => (
					<ListItem {...listItem} key={listItem.title} />
				))}
			</View>
		</View>
	)
}
