import React from 'react'
import {
	View,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	TouchableWithoutFeedback,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { BlurView } from '@react-native-community/blur'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { useNavigation, Routes } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'
import { chat } from '@berty-tech/store'
import { CommonActions } from '@react-navigation/core'

const useStylesList = () => {
	const [
		{ absolute, margin, padding, width, height, border, background, row, column },
	] = useStyles()
	return {
		tinyAvatar: [absolute.scale({ top: -32.5 }), row.item.justify],
		tinyCard: [
			margin.medium,
			margin.top.scale(42),
			padding.medium,
			padding.top.scale(42),
			height(177),
			border.radius.large,
			background.white,
			column.justify,
		],
		tinyAcceptButton: [padding.vertical.scale(5), padding.horizontal.small, border.radius.scale(6)],
		tinyDiscardButton: [
			padding.scale(5),
			margin.right.small,
			border.radius.scale(6),
			border.color.light.grey,
		],
		addContactItem: [height(115), width(150)],
		addContactItemText: width(75),
	}
}

const RequestsItem: React.FC<chat.contact.Entity> = ({ name, request, publicKey }) => {
	const { dispatch } = useNavigation()
	const _styles = useStylesList()
	const [{ border, column, flex, row, padding, text, background, color }] = useStyles()
	if (request.type !== chat.contact.ContactRequestType.Outgoing) {
		return <Text>Error: This is an outgoing request</Text>
	}
	return (
		<TouchableOpacity
			style={[_styles.tinyCard, border.shadow.medium, column.justify]}
			onPress={() =>
				dispatch(
					CommonActions.navigate({
						name: Routes.Main.RequestSent,
						params: {
							contact: {
								name,
								publicKey,
							},
						},
					}),
				)
			}
		>
			<ProceduralCircleAvatar
				style={[_styles.tinyAvatar]}
				seed={publicKey}
				size={65}
				diffSize={15}
			/>
			<Text style={[flex.tiny, text.align.center]}>{name}</Text>
			<Text
				category='c1'
				style={[padding.vertical.medium, text.align.center, text.size.tiny, text.color.grey]}
			>
				{request.sent ? 'Sent 3 days ago' : 'Not sent yet'}
			</Text>
			<View style={[row.fill]}>
				<TouchableOpacity style={[_styles.tinyDiscardButton, border.scale(1), row.item.justify]}>
					<Icon name='close-outline' width={20} height={20} fill={color.grey} />
				</TouchableOpacity>
				<TouchableOpacity
					disabled={!request.sent}
					style={[_styles.tinyAcceptButton, background.light.green, row.fill]}
				>
					<View style={[row.item.justify, padding.right.scale(3)]}>
						<Icon
							name='paper-plane-outline'
							width={17}
							height={17}
							fill={color.green}
							style={column.justify}
						/>
					</View>
					<Text style={[text.color.green, text.align.center, text.size.tiny, row.item.justify]}>
						Resend
					</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
}

const Requests: React.FC<{}> = () => {
	const [{ padding }] = useStyles()

	const requests = Chat.useAccountContactsWithOutgoingRequests().filter(
		(contact) => !(contact.request.accepted || contact.request.discarded),
	)

	return (
		<SafeAreaView>
			<View style={[padding.vertical.medium]}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{requests.map((req) => (
						<RequestsItem key={req.id} {...req} />
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	)
}

const BertyIDIcon = ({ color }) => (
	<View
		style={{
			borderColor: color,
			borderRadius: 1000,
			aspectRatio: 1,
			borderWidth: 2,
			padding: 3,
			paddingBottom: 9,
		}}
	>
		<Icon name='user' pack='feather' height={35} width={35} fill={color} />
	</View>
)

const AddContact: React.FC<{}> = () => {
	const navigation = useNavigation()
	const _styles = useStylesList()
	const [{ padding, row, column, border, background, color, text }] = useStyles()

	return (
		<View style={[padding.vertical.medium]}>
			<View style={[row.center]}>
				<TouchableOpacity
					style={[
						background.red,
						padding.medium,
						border.radius.medium,
						column.justify,
						_styles.addContactItem,
					]}
					onPress={navigation.navigate.main.scan}
				>
					<View
						style={[row.fill, { justifyContent: 'flex-end', height: 45, alignItems: 'flex-start' }]}
					>
						<Icon name='qr' pack='custom' width={40} height={40} fill={color.white} />
					</View>
					<View style={[row.fill]}>
						<Text numberOfLines={2} style={[text.color.white, _styles.addContactItemText]}>
							Scan QR code
						</Text>
						<View />
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						background.blue,
						padding.medium,
						border.radius.medium,
						column.justify,
						_styles.addContactItem,
					]}
					onPress={navigation.navigate.settings.myBertyId}
				>
					<View
						style={[row.fill, { justifyContent: 'flex-end', height: 45, alignItems: 'flex-start' }]}
					>
						<BertyIDIcon color={color.white} />
					</View>
					<View style={[row.fill]}>
						<Text numberOfLines={2} style={[text.color.white, _styles.addContactItemText]}>
							Share my Berty ID
						</Text>
						<View />
					</View>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const NewGroup: React.FC<{}> = () => <View />

const Screen = Dimensions.get('window')

export const ListModal: React.FC<{}> = () => {
	const firstNotToggledPoint = Screen.height - 193 + 16 + 35
	const firstToggledPoint = firstNotToggledPoint

	const secondNotToggledPoint = firstToggledPoint - 200
	const secondToggledPoint = secondNotToggledPoint - 163 + 20

	const thirdNotToggledPoint = secondToggledPoint - 200
	const thirdToggledPoint = thirdNotToggledPoint - 283 + 20
	const navigation = useNavigation()
	const [{ absolute, color }] = useStyles()

	return (
		<>
			<TouchableWithoutFeedback onPress={navigation.goBack} style={[StyleSheet.absoluteFill]}>
				<BlurView style={StyleSheet.absoluteFill} blurType='light' />
			</TouchableWithoutFeedback>
			<SafeAreaView style={[absolute.fill]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							title: 'New group',
							icon: 'users',
							iconPack: 'feather',
							iconColor: color.black,
							dragEnabled: false,
							headerAction: navigation.navigate.main.createGroup.createGroup2,
						},
						{
							toggledPoint: secondToggledPoint,
							notToggledPoint: secondNotToggledPoint,
							title: 'Add contact',
							icon: 'user-plus',
							iconPack: 'feather',
							iconColor: color.black,
						},
						{
							toggledPoint: thirdToggledPoint,
							notToggledPoint: thirdNotToggledPoint,
							title: 'Requests sent',
							icon: 'paper-plane-outline',
							iconColor: color.black,
						},
					]}
				>
					<NewGroup />
					<AddContact />
					<Requests />
				</SDTSModalComponent>
			</SafeAreaView>
		</>
	)
}
