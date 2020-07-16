import React, { useState, useRef, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { Messenger } from '@berty-tech/hooks'
import grpcBridge from '@berty-tech/grpc-bridge'
import { protocol, groups, messenger } from '@berty-tech/store'
import './App.css'
import storage from 'redux-persist/lib/storage'
import {
	useAccountContactSearchResults,
	useFirstConversationWithContact,
	useGetMessage,
	useGetMessageSearchResultWithMetadata,
} from '@berty-tech/hooks/Messenger'

const CreateAccount: React.FC = () => {
	const [name, setName] = useState('')
	const [port, setPort] = useState(1337)
	const createAccount = Messenger.useAccountCreate()
	return (
		<>
			<input
				type='text'
				placeholder='Account name'
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<input
				type='number'
				placeholder='Bridge port'
				value={port}
				onChange={(e) => setPort(parseInt(e.target.value, 10))}
			/>
			<button
				onClick={() =>
					createAccount({ name, nodeConfig: { type: 'external', host: 'localhost', port } })
				}
			>
				Create account
			</button>
		</>
	)
}

const Account: React.FC = () => {
	const account = Messenger.useAccount()
	const client = Messenger.useClient()
	const link = Messenger.useContactRequestReference()
	return (
		<>
			<h2>Account</h2>
			{account.name}
			<br />
			berty://{encodeURIComponent(link)}
			<br />
			<JSONed value={account} />
			<JSONed value={client} />
		</>
	)
}

const AccountGate: React.FC = ({ children }) => {
	const account = Messenger.useAccount()
	return account ? <>{children}</> : <CreateAccount />
}

const AddContact: React.FC = () => {
	const [link, setLink] = useState('')
	const sendContactRequest = Messenger.useAccountSendContactRequest()
	const [, uriComponent] = link.split('berty://')
	const [b64Name, rdvSeed, pubKey] = uriComponent ? decodeURIComponent(uriComponent).split(' ') : []
	const name = b64Name && atob(b64Name)
	return (
		<>
			<h3>Add contact</h3>
			<input
				type='text'
				placeholder='Deep link'
				value={link}
				onChange={(e) => setLink(e.target.value)}
			/>
			{name}
			{!!(name && rdvSeed && pubKey) && (
				<button onClick={() => sendContactRequest(name, rdvSeed, pubKey)}>Add contact</button>
			)}
		</>
	)
}

const JSONed: React.FC<{ value: any }> = ({ value }) => (
	<div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{JSON.stringify(value, null, 4)}</div>
)

const ContactSearchResultLastMessage: React.FC<{ lastSentMessageId: string }> = ({
	lastSentMessageId,
}) => {
	const lastMessage = useGetMessage(lastSentMessageId)
	return <JSONed value={{ body: lastMessage?.body }} />
}

const ContactSearchResult: React.FC<{ contact: any }> = ({ contact }) => {
	const firstConversationWithContact = useFirstConversationWithContact(contact.publicKey)

	return (
		<>
			<h4>Last sent message sent by me</h4>
			<ContactSearchResultLastMessage
				lastSentMessageId={firstConversationWithContact?.lastSentMessage}
			/>
			<h4>First Found Conversation With Contact</h4>
			<JSONed value={firstConversationWithContact} />
			<h4>Contact</h4>
			<JSONed value={contact} />
		</>
	)
}

const SearchContacts: React.FC = () => {
	const [searchText, setSearchText] = useState('')
	const contactSearchResults = useAccountContactSearchResults(searchText)
	return (
		<>
			<input
				type='text'
				placeholder='Search contacts'
				value={searchText}
				onChange={(e) => setSearchText(e.target.value.replace(/^\s+/g, ''))}
			/>
			<div>
				{contactSearchResults &&
					contactSearchResults.map((contact, i) => {
						return <ContactSearchResult contact={contact} key={i} />
					})}
			</div>
		</>
	)
}

const Contacts: React.FC = () => {
	const contacts = Messenger.useAccountContacts()
	return (
		<>
			<h2>Contacts</h2>
			<AddContact />
			<h3>Contacts List</h3>
			<div style={{ display: 'flex', flexWrap: 'wrap' }}>
				{contacts.map((contact) => (
					<div style={{ border: '1px solid black' }} key={contact.id}>
						<JSONed value={contact} />
					</div>
				))}
			</div>
		</>
	)
}

const Message: React.FC<{ msgId: string }> = ({ msgId }) => {
	const message = Messenger.useGetMessage(msgId)
	if (message.type === messenger.AppMessageType.UserMessage) {
		return (
			<div style={{ textAlign: message.isMe ? 'right' : 'left' }}>
				{message.isMe && message.acknowledged && '✓ '}
				{message.body}
			</div>
		)
	}
	return null
}

const Conversation: React.FC<{ convId: string }> = ({ convId }) => {
	const conv = Messenger.useGetConversation(convId)
	const sendMessage = Messenger.useMessageSend()
	const [message, setMessage] = useState('')
	const scrollRef = useRef<HTMLDivElement>(null)
	useLayoutEffect(() => {
		const div = scrollRef.current
		if (!div) return
		div.scrollTop = div.scrollHeight - div.clientHeight
	}, [conv])
	return (
		!!conv && (
			<>
				{conv.title}
				<br />
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						maxHeight: 200,
						overflowY: 'scroll',
					}}
					ref={scrollRef}
				>
					{conv.messages.map((msg) => (
						<Message key={msg} msgId={msg} />
					))}
				</div>
				<input
					type='text'
					placeholder='Type your message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				{!!message && (
					<button
						onClick={() =>
							sendMessage({
								type: messenger.AppMessageType.UserMessage,
								body: message,
								id: convId,
								attachments: [],
								sentDate: Date.now(),
							})
						}
					>
						Send
					</button>
				)}
				<JSONed value={conv} />
			</>
		)
	)
}

const SearchMessagesResult: React.FC<{ message: any }> = ({ message }) => {
	return (
		<>
			<h4>Message</h4>
			<JSONed value={message} />
		</>
	)
}

const SearchMessages: React.FC = () => {
	const [searchText, setSearchText] = useState('')
	const messageSearchResults = useGetMessageSearchResultWithMetadata(searchText)
	return (
		<>
			<input
				type='text'
				placeholder='Search messages'
				value={searchText}
				onChange={(e) => setSearchText(e.target.value.replace(/^\s+/g, ''))}
			/>
			<div>
				{messageSearchResults &&
					messageSearchResults.map((message, i) => {
						return <SearchMessagesResult message={message} key={i} />
					})}
			</div>
		</>
	)
}

const Conversations: React.FC = () => {
	const conversations = Messenger.useAllConversations()
	const [selected, setSelected] = useState('')
	return (
		<>
			<h2>Conversations</h2>
			<div style={{ display: 'flex' }}>
				{conversations.map((conv) => {
					if (conv.kind === 'fake') return null
					return (
						<button
							key={conv.id}
							disabled={selected === conv.id}
							onClick={() => setSelected(conv.id)}
						>
							{conv.title}
						</button>
					)
				})}
			</div>
			{!!selected && <Conversation convId={selected} />}
		</>
	)
}

const ClearStorage: React.FC = () => (
	<button
		onClick={() => {
			localStorage.clear()
			window.location.reload()
		}}
	>
		Clear storage
	</button>
)

const Requests: React.FC = () => {
	const outgoing = Messenger.useAccountContactsWithOutgoingRequests()
	const incoming = Messenger.useAccountContactsWithIncomingRequests()
	return (
		<>
			<h2>Requests</h2>
			<h3>Incoming</h3>
			{incoming.map((i) => (
				<div style={{ border: '1px solid black' }} key={i.id}>
					<JSONed value={i} />
				</div>
			))}
			<h3>Outgoing</h3>
			{outgoing.map((o) => (
				<div style={{ border: '1px solid black' }} key={o.id}>
					<JSONed key={o.id} value={o} />
				</div>
			))}
		</>
	)
}

let metadata: any[] = []
let messages: any[] = []

const DumpGroup: React.FC = () => {
	const [groupPk, setGroupPk] = useState('')
	const [mt, setMt] = useState([])
	const [ms, setMs] = useState([])
	return (
		<>
			<h2>Dump Group</h2>
			<input value={groupPk} placeholder='groupPK' onChange={(e) => setGroupPk(e.target.value)} />
			<button
				onClick={() => {
					const service = protocol.client.getProtocolService()
					const gpkBuf = Buffer.from(groupPk, 'base64')
					metadata = []
					messages = []
					const bridge = grpcBridge({ host: service.host, transport: service.transport })
					const grpcClient = new protocol.ProtocolServiceClient(bridge)
					grpcClient.groupMessageList({ groupPk: gpkBuf }, (...args: any[]) => {
						if (args[1]?.message) {
							const msg = JSON.parse(Buffer.from(args[1].message).toString('utf-8'))
							console.log('message:', msg)
							args[1] = { ...args[1], message: msg }
						}
						messages = [...messages, args]
						setMs(messages)
						console.log('messages callback', ...args)
					})
					grpcClient.groupMetadataList({ groupPk: gpkBuf }, (...args: any[]) => {
						if (args[1]?.event) {
							const event = protocol.client.decodeMetadataEvent(args[1])
							args[1] = { ...args[1], event }
						}
						metadata = [...metadata, args]
						setMt(metadata)
						console.log('metadata callback', ...args)
					})
				}}
			>
				Dump
			</button>
			<h3>Metadata</h3>
			<JSONed value={mt} />
			<h3>Messages</h3>
			<JSONed value={ms} />
		</>
	)
}

const Groups: React.FC = () => {
	const groups = useSelector((state: groups.GlobalState) => state.groups)
	console.log('groups', groups)
	return (
		<>
			{Object.values(groups).map((group) => (
				<JSONed key={group.publicKey} value={group} />
			))}
		</>
	)
}

const Tools: React.FC = () => {
	return (
		<>
			<DumpGroup />
		</>
	)
}

const Search: React.FC = () => {
	return (
		<>
			<h3>Search Contacts</h3>
			<SearchContacts />
			<h3>Search Messages</h3>
			<SearchMessages />
		</>
	)
}

const CreateMultiMember = () => {
	const [groupName, setGroupName] = useState('My group')
	const createGroup = Messenger.useConversationCreate({ name: groupName, members: [] })
	return (
		<>
			<input
				type='text'
				value={groupName}
				onChange={(e) => {
					setGroupName(e.target.value)
				}}
			/>
			<button onClick={createGroup}>Create</button>
		</>
	)
}

const JoinMultiMember = () => {
	const [link, setLink] = useState('')
	const createGroup = Messenger.useConversationJoin({ link })
	return (
		<>
			<input
				type='text'
				value={link}
				onChange={(e) => {
					setLink(e.target.value)
				}}
			/>
			<button onClick={createGroup}>Join</button>
		</>
	)
}

const MultiMemberList = () => {
	const unfil = Messenger.useAllConversations()
	const convs = unfil.filter(
		(conv) => conv.kind === messenger.conversation.ConversationKind.MultiMember,
	)
	return (
		<>
			{convs.map((conv) => {
				return (
					<div key={conv.id}>
						<h3>{conv.title}</h3>
						Public key: {conv.pk}
						<br />
						Link: {conv.shareableGroup}
					</div>
				)
			})}
		</>
	)
}

const MultiMember: React.FC = () => {
	return (
		<>
			<CreateMultiMember />
			<br />
			<JoinMultiMember />
			<MultiMemberList />
		</>
	)
}

const TABS = {
	Account: Account,
	Contacts: Contacts,
	Requests: Requests,
	Conversations: Conversations,
	Search: Search,
	MultiMember: MultiMember,
	Groups: Groups,
	Tools: Tools,
}

type TabKey = keyof typeof TABS

const TABS_KEYS = Object.keys(TABS) as TabKey[]

const Tabs: React.FC = () => {
	const [selected, setSelected] = useState<TabKey>('Account')
	const TabContent = TABS[selected]
	return (
		<>
			<div>
				{TABS_KEYS.map((key) => (
					<button key={key} disabled={key === selected} onClick={() => setSelected(key)}>
						{key}
					</button>
				))}
			</div>
			<div>
				<TabContent />
			</div>
		</>
	)
}

function App() {
	return (
		<Messenger.Provider config={{ storage }}>
			<div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
				<h1>Berty web dev</h1>
				<ClearStorage />
				<AccountGate>
					<Tabs />
				</AccountGate>
			</div>
		</Messenger.Provider>
	)
}

export default App
