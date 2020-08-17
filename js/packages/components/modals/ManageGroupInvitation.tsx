import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { TabBar } from '../shared-components'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

const BodyAddThisContactContent: React.FC<{}> = ({ children }) => {
	const [{ margin }] = useStyles()
	return (
		<View style={[margin.top.big]}>
			<View>{children}</View>
		</View>
	)
}

const SelectedContent = ({ contentName, groupPk }: { contentName: string; groupPk: string }) => {
	const [{ padding }] = useStyles()
	switch (contentName) {
		case 'Fingerprint':
			return <FingerprintContent seed={groupPk} />
		default:
			return (
				<Text style={[padding.horizontal.medium]}>Error: Unknown content name "{contentName}"</Text>
			)
	}
}

export const ManageGroupInvitation: React.FC<{
	groupPk: string
	displayName: string
}> = ({ groupPk = '', displayName = '' }) => {
	const navigation = useNavigation()
	const [
		{ row, text, column, color, flex, absolute, margin, padding, background, border },
	] = useStyles()
	const _styles = useStylesModal()
	const [selectedContent, setSelectedContent] = useState('Fingerprint')

	return (
		<View
			style={[{ justifyContent: 'center', alignItems: 'center', height: '100%' }, padding.medium]}
		>
			<View
				style={[
					background.white,
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					{ width: '100%' },
				]}
			>
				<View style={[absolute.scale({ top: -50 }), row.item.justify]}>
					<ProceduralCircleAvatar
						seed={groupPk}
						style={[border.shadow.big, row.center]}
						diffSize={30}
					/>
				</View>
				<View style={[padding.top.scale(55)]}>
					<Text style={[text.color.blue, margin.vertical.small, { textAlign: 'center' }]}>
						You've joined the group
						<Text style={[text.bold.medium]}> {displayName}</Text>
					</Text>
					<TabBar
						tabs={[
							{ name: 'Fingerprint', icon: 'fingerprint', iconPack: 'custom' } as any, // TODO: fix typing
							{ name: 'Info', icon: 'info-outline', buttonDisabled: true },
							{
								name: 'Devices',
								icon: 'smartphone',
								iconSize: 20,
								iconPack: 'feather',
								iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
								buttonDisabled: true,
							} as any,
						]}
						onTabChange={setSelectedContent}
					/>
					<BodyAddThisContactContent>
						<SelectedContent contentName={selectedContent} groupPk={groupPk} />
					</BodyAddThisContactContent>
				</View>
				<View style={[padding.top.big, row.fill, padding.medium]}>
					<TouchableOpacity
						onPress={() => {
							navigation.navigate('Main.HomeModal')
						}}
						style={[
							flex.medium,
							background.light.blue,
							padding.vertical.scale(12),
							border.radius.small,
						]}
					>
						<Text style={[text.color.blue, { textAlign: 'center' }]}>Got it!</Text>
					</TouchableOpacity>
				</View>
			</View>
			<TouchableOpacity
				style={[
					background.white,
					padding.vertical.medium,
					border.shadow.medium,
					row.item.justify,
					column.justify,
					_styles.closeRequest,
					{ position: 'absolute', bottom: '2%' },
				]}
				onPress={navigation.goBack}
			>
				<Icon
					style={[row.item.justify, _styles.closeRequestIcon]}
					name='close-outline'
					width={25}
					height={25}
					fill={color.grey}
				/>
			</TouchableOpacity>
		</View>
	)
}
