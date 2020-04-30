import React from 'react'
import {
	View,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	TouchableWithoutFeedback,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { BlurView } from '@react-native-community/blur'
// import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { useNavigation, Routes } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'
import { chat } from '@berty-tech/store'
import { CommonActions } from '@react-navigation/core'
import Interactable from 'react-native-interactable'
import FromNow from '../shared-components/FromNow'

const useStylesList = () => {
	const [
		{ absolute, margin, padding, width, height, border, background, row, column },
	] = useStyles()
	return {
		tinyAvatar: [absolute.scale({ top: -32.5 }), row.item.justify],
		tinyCard: [
			margin.medium,
			padding.medium,
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

const Header: React.FC<{
	title: string
	icon: string
	iconPack?: string
	first?: boolean
	disabled?: boolean
}> = ({ children, title, icon, iconPack, first = false, disabled = false }) => {
	const [
		{ height, border, margin, row, padding, text, column, color, background, opacity },
	] = useStyles()
	return (
		<View style={!first && [background.white]}>
			<View
				style={[
					background.white,
					border.radius.top.scale(30),
					border.shadow.big,
					disabled && opacity(0.5),
				]}
			>
				<View style={[height(80)]}>
					<View
						style={[
							margin.top.small,
							row.item.justify,
							border.scale(2.5),
							border.color.light.grey,
							border.radius.scale(4),
							{
								backgroundColor: '#E8E9FC',
								width: '14%',
							},
						]}
					/>
					<View>
						<View
							style={[
								row.fill,
								padding.horizontal.medium,
								padding.bottom.medium,
								padding.top.small,
							]}
						>
							<Text
								style={[
									text.bold.medium,
									text.size.scale(20),
									text.color.black,
									column.item.center,
								]}
							>
								{title}
							</Text>
							{icon && (
								<Icon name={icon} pack={iconPack} width={30} height={30} fill={color.black} />
							)}
						</View>
					</View>
				</View>
				{children && <View>{children}</View>}
			</View>
		</View>
	)
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
				size={70}
				diffSize={30}
			/>
			<Text style={[flex.tiny, text.align.center, padding.top.medium]}>{name}</Text>
			<Text
				category='c1'
				style={[padding.vertical.medium, text.align.center, text.size.tiny, text.color.grey]}
			>
				{request.sent ? <FromNow date={request.sentDate} /> : 'Not sent yet'}
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

const EmptyTab: React.FC<{}> = () => {
	const [{ padding, background }] = useStyles()
	return <View style={[padding.bottom.medium, background.white, padding.vertical.medium]} />
}

const Requests: React.FC<{}> = () => {
	const [{ padding, background }] = useStyles()

	const requests = Chat.useAccountContactsWithOutgoingRequests().filter(
		(contact) => !(contact.request.accepted || contact.request.discarded),
	)

	return requests.length >= 1 ? (
		<View style={[background.white]}>
			<View style={[padding.vertical.medium, background.white]}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{requests.map((req) => (
						<RequestsItem key={req.id} {...req} />
					))}
				</ScrollView>
			</View>
		</View>
	) : (
		<EmptyTab />
	)
}

const AddContact: React.FC<{}> = () => {
	const navigation = useNavigation()
	const _styles = useStylesList()
	const [{ padding, row, column, border, background, color, text }] = useStyles()

	return (
		<View style={[padding.vertical.medium, background.white, padding.bottom.big]}>
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
						<Icon name='qr' pack='custom' width={38} height={38} fill={color.white} />
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
						<Icon name='id' pack='custom' width={40} height={40} fill={color.white} />
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

export const ListModal: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [{ absolute }] = useStyles()

	const handleOnDrag = (e) => {
		if (e.nativeEvent.y >= 250) {
			navigation.goBack()
		}
	}
	return (
		<>
			<TouchableWithoutFeedback style={[StyleSheet.absoluteFill]} onPress={navigation.goBack}>
				<BlurView style={{ width: '100%', height: '100%' }} blurType='light' />
			</TouchableWithoutFeedback>
			<View style={[absolute.bottom, absolute.left, absolute.right]}>
				<Interactable.View
					verticalOnly={true}
					snapPoints={[{ x: 0 }, { x: -300 }]}
					onDrag={(e: any) => handleOnDrag(e)}
					boundaries={{ top: 0 }}
				>
					<Header title='Add contact' icon='user-plus' iconPack='custom' first>
						<AddContact />
					</Header>
					<Header title='Requests sent' icon='paper-plane-outline'>
						<Requests />
					</Header>
					<Header title='New group' icon='users' iconPack='custom' disabled>
						<EmptyTab />
					</Header>
				</Interactable.View>
			</View>
		</>
	)
}
