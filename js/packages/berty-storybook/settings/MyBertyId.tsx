import React, { useState, Fragment } from 'react'
import {
	SafeAreaView,
	View,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Dimensions,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { RequestProps } from '../shared-props/User'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { Chat } from '@berty-tech/hooks'
import QRCode from 'react-native-qrcode-svg'

//
// Settings My Berty ID Vue
//

// Style
const useStylesBertyId = () => {
	const [{ margin, padding, maxHeight, minHeight }] = useStyles()
	return {
		bodyMarginTop: margin.top.scale(60),
		bodyContent: [margin.bottom.scale(40), padding.top.scale(50)],
		scrollViewMaxHeight: maxHeight(400),
		contentMinHeight: minHeight(400),
	}
}
const _bertyIdStyles = StyleSheet.create({
	headerToggleBar: {
		borderWidth: 2.5,
		width: '12%',
		borderRadius: 4,
	},
	bertyLayout: { borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '100%' },
	bertyIdButton: { width: 60, height: 60, borderRadius: 60 / 2, marginRight: 60, bottom: 30 },
})

const BertyIdContent: React.FC<{}> = ({ children }) => {
	const _styles = useStylesBertyId()
	const [{ padding, column, text }] = useStyles()

	return (
		<ScrollView
			style={[_styles.scrollViewMaxHeight]}
			contentContainerStyle={[padding.vertical.medium]}
		>
			<View style={[column.justify, { alignItems: 'center' }]}>{children}</View>
		</ScrollView>
	)
}

const ContactRequestQR = () => {
	const contactRequestEnabled = Chat.useAccountContactRequestEnabled()
	const contactRequestReference = Chat.useAccountContactRequestReference()
	if (contactRequestEnabled) {
		// I would like to use binary mode in QR but the scanner used seems to not support it, extended tests were done
		return (
			<>
				<QRCode size={200} value={contactRequestReference} />
				{__DEV__ && <Text selectable={true}>{contactRequestReference}</Text>}
			</>
		)
	} else {
		return <Text>Error: Contact request is disabled</Text>
	}
}

const SelectedContent = ({ contentName }: { contentName: string }) => {
	switch (contentName) {
		case 'QR':
			return <ContactRequestQR />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const BertIdBody: React.FC<RequestProps> = ({ user }) => {
	const _styles = useStylesBertyId()
	const [{ background, border, margin, padding }] = useStyles()
	const [selectedContent, setSelectedContent] = useState()
	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				_styles.bodyMarginTop,
			]}
		>
			<RequestAvatar {...user} size={90} />
			<View style={[padding.horizontal.big, _styles.bodyContent]}>
				<TabBar tabType='contact' onTabChange={setSelectedContent} />
				<BertyIdContent>
					<SelectedContent contentName={selectedContent} />
				</BertyIdContent>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, background, flex, color }] = useStyles()
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				background.light.blue,
				border.shadow.medium,
				_bertyIdStyles.bertyIdButton,
			]}
		>
			<View style={[flex.tiny, { justifyContent: 'center' }]}>
				<Icon
					style={row.item.justify}
					name='share-outline'
					width={40}
					height={40}
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const Screen = Dimensions.get('window')

const MyBertyIdComponent: React.FC<RequestProps> = ({ user }) => (
	<View style={{ height: Screen.height }}>
		<BertIdBody user={user} />
		<BertyIdShare />
	</View>
)

export const MyBertyId: React.FC<RequestProps> = ({ user }) => {
	const firstNotToggledPoint = Screen.height - 120
	const firstToggledPoint = 20

	const [{ flex, color }] = useStyles()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							initialPoint: firstToggledPoint,
							title: 'My Berty ID',
							titleColor: color.white,
							icon: 'person',
							iconColor: color.white,
							bgColor: color.blue,
							maxHeight: Screen.height - 90,
						},
					]}
				>
					<MyBertyIdComponent user={user} />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}
