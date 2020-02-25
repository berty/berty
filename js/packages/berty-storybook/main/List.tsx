import React from 'react'
import { Text, TouchableOpacity, View, ViewProps, SafeAreaView, ScrollView } from 'react-native'
import { Translation } from 'react-i18next'
import { google } from '@berty-tech/api'
import { useLayout } from '../hooks'
import { Footer } from './Footer'
import { useStyles } from '@berty-tech/styles'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { Chat } from '@berty-tech/hooks'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { chat } from '@berty-tech/store'
import * as dateFns from '@berty-tech/berty-i18n/dateFns'

type Navigation<T extends {} | undefined = undefined> = (arg0: T) => void

//
// Main List
//

type RequestsProps = ViewProps & {
	items: Array<chat.contact.Entity>
}

// Functions

const date = (timestamp?: google.protobuf.ITimestamp | null): Date => {
	const { seconds, nanos } = timestamp || { seconds: 0, nanos: 0 }
	const _ = new Date()
	_.setTime((seconds as number) * 1000 + (nanos as number) / 1000)
	return _
}

const RequestsItem: React.FC<{
	id: string
	name: string
	avatarUris: Array<string>
	display: Navigation<{ id: string }>
	accept: (kwargs: { id: string }) => void
	decline: (kwargs: { id: string }) => void
}> = (props) => {
	const { id, name, avatarUris, display, decline, accept } = props
	const [
		{ border, padding, margin, width, height, column, row, background, absolute, text },
	] = useStyles()
	return (
		<Translation>
			{(t): React.ReactNode => (
				<TouchableOpacity
					style={[
						column.fill,
						width(121),
						height(177),
						background.white,
						margin.medium,
						margin.top.huge,
						padding.medium,
						padding.top.huge,
						border.radius.medium,
						border.shadow.medium,
					]}
					onPress={() => display({ id })}
				>
					<CircleAvatar
						style={[absolute.center, absolute.scale({ top: -32.5 })]}
						avatarUri={avatarUris[0]}
						size={65}
						diffSize={8}
					/>
					<Text style={[text.align.center, text.color.black, text.size.medium]} numberOfLines={2}>
						{name}
					</Text>
					<Text style={[text.size.tiny, text.color.grey, text.align.center]}>
						Some time a long ago (in a galaxy far far away)
					</Text>
					<View style={[row.center]}>
						<TouchableOpacity
							style={[
								border.medium,
								border.color.light.grey,
								row.item.justify,
								border.medium,
								border.radius.tiny,
								border.shadow.tiny,
								background.white,
								padding.horizontal.tiny,
								margin.right.tiny,
							]}
							onPress={(): void => {
								decline({ id })
							}}
						>
							<Text style={[text.size.tiny, text.color.grey, row.item.justify, padding.small]}>
								x
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								background.light.blue,
								row.item.justify,
								border.radius.tiny,
								border.shadow.tiny,
								padding.horizontal.tiny,
								margin.left.tiny,
							]}
							onPress={(): void => {
								accept({ id })
							}}
						>
							<Text style={[text.size.tiny, text.color.blue, row.item.justify, padding.small]}>
								{t('main.requests.accept')}
							</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			)}
		</Translation>
	)
}

const ContactRequestsItem: React.FC<chat.contact.Entity> = ({ id, name }) => {
	const { navigate } = useNavigation()
	const accept = Chat.useAcceptContactRequest()
	const decline = Chat.useDiscardContactRequest()
	return (
		<RequestsItem
			id={id}
			name={name}
			avatarUris={[]}
			display={/*navigate.main.contactRequest*/ ({ id }) => {}}
			accept={accept}
			decline={decline}
		/>
	)
}

const Requests: React.FC<RequestsProps> = ({ items, style, onLayout }) => {
	const [{ padding, text }] = useStyles()
	return items?.length ? (
		<SafeAreaView onLayout={onLayout} style={style}>
			<View style={[padding.top.medium]}>
				<Text style={[text.color.white, text.size.huge, text.bold, padding.medium]}>Requests</Text>
				<ScrollView
					horizontal
					style={[padding.bottom.medium]}
					showsHorizontalScrollIndicator={false}
				>
					{items.map((_) => {
						return <ContactRequestsItem {..._} />
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null
}

export const List: React.FC<ScreenProps.Chat.List> = () => {
	const navigation = useNavigation()
	// TODO: do something to animate the requests
	const [, onLayoutRequests] = useLayout()

	const requests = Chat.useAccountContactsWithIncomingRequests().filter(
		(contact) => !(contact.request.accepted || contact.request.discarded),
	)

	const [{ absolute, background }] = useStyles()

	return (
		<View style={[absolute.fill, background.blue]}>
			<Requests items={requests} onLayout={onLayoutRequests} />
			<Footer {...navigation} />
		</View>
	)
}

export default List
