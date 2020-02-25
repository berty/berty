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
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { useNavigation } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'
import { chat } from '@berty-tech/store'

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
			width(121),
			height(177),
			border.radius.large,
			background.white,
			column.justify,
		],
		tinyAcceptButton: [
			padding.horizontal.tiny,
			padding.vertical.scale(4),
			border.radius.scale(4),
			margin.horizontal.scale(4),
		],
		tinyDiscardButton: [
			padding.scale(4),
			border.radius.scale(4),
			border.color.light.grey,
			margin.horizontal.scale(4),
		],
		addContactItem: [height(115), width(150)],
		addContactItemText: width(75),
	}
}

const RequestsItem: React.FC<chat.contact.Entity> = ({ id, name, request }) => {
	const navigation = useNavigation()
	const _styles = useStylesList()
	const [{ border, column, flex, row, padding, text, background, color }] = useStyles()
	if (request.type !== chat.contact.ContactRequestType.Outgoing) {
		return <Text>Error: This is an outgoing request</Text>
	}
	return (
		<TouchableOpacity
			style={[_styles.tinyCard, border.shadow.medium, column.justify]}
			onPress={navigation.navigate.main.requestSent}
		>
			<CircleAvatar
				style={_styles.tinyAvatar}
				avatarUri='https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'
				size={65}
				diffSize={8}
			/>
			<Text numberOfLines={1} style={[flex.tiny, text.align.center]}>
				{name}
			</Text>
			<Text
				category='c1'
				style={[padding.vertical.medium, text.align.center, text.size.tiny, text.color.grey]}
			>
				{request.sent ? 'Sent 3 days ago' : 'Not sent yet'}
			</Text>
			<View style={[row.center]}>
				<TouchableOpacity
					style={[
						_styles.tinyDiscardButton,
						border.radius.scale(7),
						border.scale(1),
						row.item.justify,
					]}
				>
					<Icon name='close-outline' width={15} height={15} fill={color.grey} />
				</TouchableOpacity>
				<TouchableOpacity
					disabled={!request.sent}
					style={[_styles.tinyAcceptButton, background.light.green, row.center]}
				>
					<Icon
						name='checkmark-outline'
						width={15}
						height={15}
						fill={color.green}
						style={column.justify}
					/>
					<Text style={[text.size.tiny, text.color.green]}>Resend</Text>
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
					<View style={[row.fill]}>
						<View />
						<Icon name='image-outline' height={50} width={50} fill={color.white} />
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
					<View style={[row.fill]}>
						<View />
						<Icon name='person-outline' height={50} width={50} fill={color.white} />
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
							icon: 'people-outline',
							iconColor: color.black,
							dragEnabled: false,
							headerAction: navigation.navigate.main.createGroup.createGroup2,
						},
						{
							toggledPoint: secondToggledPoint,
							notToggledPoint: secondNotToggledPoint,
							title: 'Add contact',
							icon: 'person-add-outline',
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
