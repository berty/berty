import React, { useState } from 'react'
import { View, Text, TextInput, Button, Linking } from 'react-native'
import {
	useMountEffect,
	MessengerContext,
	useMessengerContext,
	InteractionUserMessage,
	isClosing,
	isReadyingBasics,
	MessengerProvider,
} from '@berty-tech/store'
import messengerMethodsHooks from '@berty-tech/store/methods'
import beapi from '@berty-tech/api'
import {	useAllContacts,
	useAllConversations,
	useConversation,
	useConversationInteractions
} from '@berty-tech/react-redux'
import {useContactsDict} from '@berty-tech/react-redux/hooks/messenger.hooks'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'


const useAccountContactSearchResults = (terms: string): beapi.messenger.Contact[] => {
	return []
}

const CreateAccount: React.FC = () => {
	const [name, setName] = useState('')
	const [error, setError] = useState<Error | null>(null)
	const ctx = React.useContext(MessengerContext)
	const handleCreate = React.useCallback(() => {
		setError(null)
		const client = (ctx.client! as unknown) as WelshMessengerServiceClient

		client.accountUpdate({ displayName: name }).catch((err: any) => setError(err))
	}, [ctx.client, name])
	return (
		<>
			<TextInput
				placeholder='Account name'
				value={name}
				onChangeText={(e) => setName(e)}
			/>
			<Error value={error} />
			<Button onPress={handleCreate} title={'Update account'}/>
		</>
	)
}

const Account: React.FC = () => {
	const ctx = React.useContext(MessengerContext)
	const account = ctx.accounts.find(a => a.accountId === ctx.selectedAccount) || null
	return (
		<>
			<Text>Account</Text>
			<JSONed value={account} />
		</>
	)
}

const AccountGate: React.FC = ({ children }) => {
	const ctx = React.useContext(MessengerContext)
	const account = ctx.accounts.find(a => a.accountId === ctx.selectedAccount) || null

	return account && account.name !== '' ? <>{children}</> : <CreateAccount />
}

const AddContact: React.FC = () => {
	const [link, setLink] = useState('')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MessengerContext)
	const handleAdd = React.useCallback(() => {
		setError(null)
		const client = (ctx.client! as unknown) as WelshMessengerServiceClient

		client.contactRequest({ link }).catch((err: any) => setError(err))
	}, [ctx.client, link])
	return (
		<>
			<Text>Add contact</Text>
			<TextInput
				placeholder='Deep link'
				value={link}
				onChangeText={(e) => setLink(e)}
			/>
			<Error value={error} />
			<Button onPress={handleAdd} title={'Add contact'}/>
		</>
	)
}

const JSONed: React.FC<{ value: any }> = ({ value }) => (
	<View>
		<Text style={{ textAlign: 'left' }}>
		{JSON.stringify(value, null, 4)}
		</Text>
	</View>
)

const ContactSearchResultLastMessage: React.FC<{ convId: string }> = ({ convId }) => {
	const intes = (useConversationInteractions(convId) as beapi.messenger.IInteraction[]).filter(
		inte => inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage,
	)

	if (!intes) {
		return null
	}
	const messages = Object.values(intes).filter(
		inte => inte.isMine && inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage,
	)
	if (messages.length <= 0) {
		return null
	}
	const lastMessage = messages[messages.length - 1]
	return <JSONed value={{ body: lastMessage?.payload }} />
}

const ContactSearchResult: React.FC<{ contact: beapi.messenger.IContact }> = ({ contact }) => {
	const firstConversationWithContact = useConversation(contact.conversationPublicKey)

	if (!firstConversationWithContact || !contact.conversationPublicKey) {
		return null
	}

	return (
		<>
			<Text>Last sent message sent by me</Text>
			<ContactSearchResultLastMessage convId={contact.conversationPublicKey} />
			<Text>First Found Conversation With Contact</Text>
			<JSONed value={firstConversationWithContact} />
			<Text>Contact</Text>
			<JSONed value={contact} />
		</>
	)
}

const SearchContacts: React.FC = () => {
	const [searchText, setSearchText] = useState('')
	const contactSearchResults = useAccountContactSearchResults(searchText)
	return (
		<>
			<TextInput
				placeholder='Search contacts'
				value={searchText}
				onChangeText={(e) => setSearchText(e.replace(/^\s+/g, ''))}
			/>
			<View>
				{contactSearchResults &&
					contactSearchResults.map(contact => {
						return <ContactSearchResult contact={contact} key={contact.publicKey} />
					})}
			</View>
		</>
	)
}

const AcceptButton: React.FC<{ publicKey: string }> = ({ publicKey }) => {
	const ctx = React.useContext(MessengerContext)
	const [error, setError] = React.useState(null)
	const handleAccept = React.useCallback(() => {
		setError(null)
		const client = (ctx.client! as unknown) as WelshMessengerServiceClient

		client.contactAccept({ publicKey }).catch((err: any) => setError(err))
	}, [ctx.client, publicKey])
	return (
		<>
			<Error value={error} />
			<Button onPress={handleAccept} title={'Accept'}/>
		</>
	)
}

const Contacts: React.FC = () => {
	const contacts = useAllContacts() as beapi.messenger.Contact[]

	return (
		<>
			<Text>Contacts</Text>
			<AddContact />
			<Text>Contacts List</Text>
			<View style={{ display: 'flex', flexWrap: 'wrap' }}>
				{contacts.map(contact => (
					<View style={{ borderStyle: 'solid', borderWidth: 1, borderColor: 'black' }} key={contact.publicKey}>
						<JSONed value={contact} />
						{contact.state === beapi.messenger.Contact.State.IncomingRequest && (
							<AcceptButton publicKey={contact.publicKey} />
						)}
					</View>
				))}
			</View>
		</>
	)
}

const Interaction: React.FC<{ value: beapi.messenger.IInteraction }> = ({ value }) => {
	if (value.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		const payload = (value as InteractionUserMessage).payload
		return (
			<View>
				<Text style={{ textAlign: value.isMine ? 'right' : 'left' }}>
				{value.isMine && value.acknowledged && '✓ '}
				{payload?.body}
				</Text>
			</View>
		)
	} else if (value.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation) {
		return (
			<View>
				<Text >
				{value.isMine ? 'Sent group invitation!' : 'Received group invitation!'}
				</Text>
				{!value.isMine && (
					<Button disabled title={'Accept (not supported)'} onPress={() => {}}/>
				)}
			</View>
		)
	}
	return null
}

const Conversation: React.FC<{ publicKey: string }> = ({ publicKey }) => {
	const ctx = React.useContext(MessengerContext)
	const conv = useConversation(publicKey)
	const [message, setMessage] = useState<string>('')
	const [error, setError] = useState(null)
	useMountEffect(() => {
		const client = (ctx.client! as unknown) as WelshMessengerServiceClient

		client.conversationOpen({ groupPk: conv.publicKey }).catch((err: Error) => {
			console.warn('failed to open conversation,', err)
		})
		return () => {
			const client = (ctx.client! as unknown) as WelshMessengerServiceClient

			client.conversationClose({ groupPk: conv.publicKey }).catch((err: Error) => {
				console.warn('failed to close conversation,', err)
			})
		}
	})


	const displayName = conv.displayName || '<undefined displayName>'
	const interactions = (useConversationInteractions(publicKey) as beapi.messenger.IInteraction[]).filter(
		inte => inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage,
	)

	const usermsg = { body: message }
	console.log('sending', usermsg)
	const buf = beapi.messenger.AppMessage.UserMessage.encode(usermsg).finish()
	console.log('encoded', buf)
	const decoded = beapi.messenger.AppMessage.UserMessage.decode(buf)
	console.log('decoded', decoded)

	const handleSend = React.useCallback(() => {
		setError(null)
		const client = (ctx.client! as unknown) as WelshMessengerServiceClient

		client.interact({
				conversationPublicKey: publicKey,
				type: beapi.messenger.AppMessage.Type.TypeUserMessage,
				payload: buf,
			})
			.catch((e: any) => setError(e))
	}, [buf, ctx.client, publicKey])

	// const scrollRef = useRef<HTMLDivElement>(null)
	// useLayoutEffect(() => {
	// 	const div = scrollRef.current
	// 	if (!div) return
	// 	div.scrollTop = div.scrollHeight - div.clientHeight
	// }, [])
	return (
		conv ? (
			<>
				<Text>{displayName}</Text>
				<View
					style={{
						display: 'flex',
						flexDirection: 'column',
						maxHeight: 200,
						// overflowY: 'scroll',
					}}
					// ref={scrollRef}
				>
					{(interactions || []).map(inte => (
						<Interaction key={inte.cid} value={inte} />
					))}
				</View>
				<TextInput
					placeholder='Type your message'
					value={message}
					onChangeText={(e) => setMessage(e)}
				/>
				{!!message && <Button onPress={handleSend} title={'Send'}/>}
				<Error value={error} />
				<JSONed value={conv} />
			</>
		) : null
	)
}

const ConvButton: React.FC<{ conv: beapi.messenger.IConversation; onSelect: (_: string) => void; selected: string }> = ({
																																								conv,
																																								onSelect,
																																								selected,
																																							}) => {
	const unreadCount = parseInt(String(conv.unreadCount ? conv.unreadCount : 0), 10)
	return (
		<Button
			key={conv.publicKey}
			disabled={selected === conv.publicKey}
			onPress={() => onSelect(conv.publicKey || '')}
			title={conv.displayName || `<undefined displayName> ${unreadCount !== 0 && '(' + unreadCount + ')'}`}
		/>
	)
}

const Conversations: React.FC = () => {
	const conversations = useAllConversations() as beapi.messenger.Conversation[]
	const [selected, setSelected] = useState('')
	return (
		<>
			<Text>Conversations</Text>
			<View style={{ display: 'flex' }}>
				{conversations.map(conv => (
					<ConvButton key={conv.publicKey} conv={conv} onSelect={setSelected} selected={selected} />
				))}
			</View>
			{!!selected && <Conversation publicKey={selected} />}
		</>
	)
}

const Search: React.FC = () => {
	return (
		<>
			<Text>Search Contacts</Text>
			<SearchContacts />
		</>
	)
}

const Error: React.FC<{ value: Error | null }> = ({ value }) => (
	<Text style={{ color: 'red' }}>{value && value.toString()}</Text>
)

const CreateMultiMember = () => {
	const [groupName, setGroupName] = useState('My group')
	const [error, setError] = useState<Error | null>(null)
	const [members, setMembers] = useState<beapi.messenger.IMember[]>([])
	const { call, error: errorReply, done } = messengerMethodsHooks.useConversationCreate()
	const createGroup = React.useCallback(
		() => call({ displayName: groupName, contactsToInvite: members.map((m) => m.publicKey!) }),
		[groupName, members, call],
	)
	const contactList = useAllContacts() as beapi.messenger.IContact[]
	React.useEffect(() => {
		// TODO: better handle error
		if (done) {
			if (errorReply) {
				setError(errorReply)
			}
		}
	}, [done, errorReply])
	return (
		<>
			{contactList
				.filter((contact) => contact.state === beapi.messenger.Contact.State.Accepted)
				.map((contact) => (
					<Button
						key={`${contact.publicKey}`}
						onPress={() =>
							members.find((m) => m.publicKey === contact.publicKey)
								? setMembers(members.filter((member) => member.publicKey !== contact.publicKey))
								: setMembers([...members, contact])
						}
						title={contact.displayName + ' ' +
								(members.find((m) => m.publicKey === contact.publicKey) ? '🅧' : '+')}
					/>
				))}
			<TextInput
				value={groupName}
				onChangeText={(e) => {
					setGroupName(e)
				}}
			/>
			<Error value={error} />
			<Button onPress={createGroup} title={'Create'}/>
		</>
	)
}

const SendToAll: React.FC = () => {
	const [latestError, setLatestError] = useState<Error | null>(null)
	const [disabled, setDisabled] = useState(false)
	const ctx = React.useContext(MessengerContext)
	const convs = (useAllConversations() as beapi.messenger.IConversation[]).filter(
		conv => conv.type === beapi.messenger.Conversation.Type.ContactType,
	)
	const body = `Test, ${new Date(Date.now()).toLocaleString()}`
	const buf: Uint8Array = beapi.messenger.AppMessage.UserMessage.encode({ body }).finish()
	const [sentToDisplayNames, setSentToDisplayNames] = useState<string[]>([])
	const contacts = useContactsDict() as {[key: string]: beapi.messenger.Contact}

	const handleSend = React.useCallback(async () => {
		setSentToDisplayNames([])
		setDisabled(true)
		setLatestError(null)
		let names = []
		for (const conv of convs) {
			try {
				const client = (ctx.client! as unknown) as WelshMessengerServiceClient

				await client.interact({
					conversationPublicKey: conv.publicKey,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
				})
			} catch (e: any) {
				setLatestError(e as Error)
			}

			if (conv.contactPublicKey) {
				names.push(contacts[conv.contactPublicKey].displayName)
			}
		}
		setSentToDisplayNames(names)
		setDisabled(false)
	}, [buf, convs, ctx.client, contacts])

	return (
		<View style={{ marginTop: '5%' }}>
			<Button onPress={handleSend} disabled={disabled} title={`Send ${body} to ${convs.map((conv) => contacts[conv.contactPublicKey || '']?.displayName).join(' ')}`}/>
			{sentToDisplayNames.length > 0 && (
				<>
					<Text>Message sent to:</Text>
					<JSONed value={sentToDisplayNames} />
				</>
			)}
			{latestError && <Error value={latestError} />}
		</View>
	)
}

const JoinMultiMember = () => {
	const [link, setLink] = useState('')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MessengerContext)
	const handleJoin = React.useCallback(() => {
		setError(null)
		const client = (ctx.client! as unknown) as WelshMessengerServiceClient

		client.conversationJoin({ link }).catch((err: any) => setError(err))
	}, [ctx.client, link])
	return (
		<>
			<TextInput
				value={link}
				onChangeText={(e) => {
					setLink(e)
				}}
			/>
			<Error value={error} />
			<Button onPress={handleJoin} title={'Join'}/>
		</>
	)
}

const MultiMemberList = () => {
	const conversations = useAllConversations() as beapi.messenger.Conversation[]

	const convs = Object.values(conversations).filter(
		(conv) => conv.type === beapi.messenger.Conversation.Type.MultiMemberType,
	)
	return (
		<>
			{convs.map(conv => {
				return (
					<View key={conv.publicKey}>
						<Text>{conv.displayName}</Text>
						<Text>Public key: {conv.publicKey}</Text>
						<Text>Link: {conv.link}</Text>
					</View>
				)
			})}
		</>
	)
}

const MultiMember: React.FC = () => {
	return (
		<>
			<CreateMultiMember />
			<Text>{`\n`}</Text>
			<JoinMultiMember />
			<MultiMemberList />
		</>
	)
}

const DumpStore: React.FC = () => {
	const ctx = useMessengerContext()
	return <JSONed value={ctx} />
}

const TABS = {
	Contacts: Contacts,
	Conversations: Conversations,
	Search: Search,
	MultiMember: MultiMember,
	DumpStore: DumpStore,
	SendToAll: SendToAll,
}

type TabKey = keyof typeof TABS

const TABS_KEYS = Object.keys(TABS) as TabKey[]

const Tabs: React.FC = () => {
	const [selected, setSelected] = useState<TabKey>('Contacts')
	const TabContent = TABS[selected]
	return (
		<>
			<View>
				{TABS_KEYS.map((key) => (
					<Button key={key} disabled={key === selected} onPress={() => setSelected(key)} title={key}/>
				))}
			</View>
			<View>
				<TabContent />
			</View>
		</>
	)
}

const ListGate: React.FC = ({ children }) => {
	const ctx = React.useContext(MessengerContext)
	if (!isClosing(ctx.appState) && !isReadyingBasics(ctx.appState)) {
		return <>{children}</>
	} else {
		return <Text>Loading..</Text>
	}
}

function getParam(sVar: string) {
	return unescape(
		window.location.search.replace(
			new RegExp(
				'^(?:.*[&\\?]' + escape(sVar).replace(/[.+*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$',
				'i',
			),
			'$1',
		),
	)
}

const daemonAddrParamName = 'daemonAddress'

const StreamGate: React.FC = ({ children }) => {
	const ctx = React.useContext(MessengerContext)
	const exampleAddr = `${window.location.protocol}//${window.location.host}/?${daemonAddrParamName}=http://localhost:1337`
	if (ctx.streamError) {
		return (
			<>
				<Text>
					<Error value={ctx.streamError} />
				</Text>
				<Text>
					Likely couldn't connect to the node, or the connection dropped
					{`\n`}
					You can change the node's address by using the "{daemonAddrParamName}" url parameter
					{`\n`}
					Example:
				</Text>
				<Button onPress={() => Linking.openURL(exampleAddr)} title={exampleAddr}/>
			</>
		)
	}
	return <>{children}</>
}

function App() {
	const daemonAddress = getParam(daemonAddrParamName) || 'http://127.0.0.1:1337'

	return (
		<View style={{ display: 'flex', flexDirection: 'column' }}>
			<Text>Berty web dev</Text>
			<Text>Daemon address is "{daemonAddress}"</Text>
			<MessengerProvider daemonAddress={daemonAddress} embedded={false}>
				<StreamGate>
					<ListGate>
						<Account />
						<AccountGate>
							<Tabs />
						</AccountGate>
					</ListGate>
				</StreamGate>
			</MessengerProvider>
		</View>
	)
}

export default App
