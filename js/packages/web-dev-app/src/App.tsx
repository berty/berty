import React, { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { Chat, Notifications } from '@berty-tech/hooks'
import { notifications } from '@berty-tech/store'
import grpcBridge from '@berty-tech/grpc-bridge'
import { protocol } from '@berty-tech/store'
import { AppMessageType } from '@berty-tech/store/chat/AppMessage'
import ProtocolServiceClient from '@berty-tech/store/protocol/ProtocolServiceClient.gen'
import './App.css'
import storage from 'redux-persist/lib/storage'
import ReactNotification, { store as reactNotifStore } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'

const CreateAccount: React.FC = () => {
	const [name, setName] = useState('')
	const [port, setPort] = useState(1337)
	const createAccount = Chat.useAccountCreate()
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
	const account = Chat.useAccount()
	const client = Chat.useClient()
	const link = Chat.useContactRequestReference()
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
	const account = Chat.useAccount()
	return account ? <>{children}</> : <CreateAccount />
}

const AddContact: React.FC = () => {
	const [link, setLink] = useState('')
	const sendContactRequest = Chat.useAccountSendContactRequest()
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

const Contacts: React.FC = () => {
	const contacts = Chat.useAccountContacts()
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
	const message = Chat.useGetMessage(msgId)
	if (message.type !== AppMessageType.UserMessage) {
		return null
	}
	return (
		<div style={{ textAlign: message.isMe ? 'right' : 'left' }}>
			{message.isMe && message.acknowledged && '✓ '}
			{message.body}
		</div>
	)
}

const Conversation: React.FC<{ convId: string }> = ({ convId }) => {
	const conv = Chat.useGetConversation(convId)
	const sendMessage = Chat.useMessageSend()
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
								type: AppMessageType.UserMessage,
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

function usePrevious<T>(value: T) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef<T>()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

const Conversations: React.FC = () => {
	const conversations = Chat.useConversationList()

	const [selected, setSelected] = useState('')
	const selectedPreviously = usePrevious(selected)
	const startRead = Chat.useStartReadConversation(selected)
	const stopReadPrevious = Chat.useStopReadConversation(selectedPreviously)
	useEffect(() => {
		if (selected !== selectedPreviously) {
			stopReadPrevious()
			startRead()
		}

		return stopReadPrevious
	}, [selected, selectedPreviously, startRead, stopReadPrevious])
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
	const outgoing = Chat.useAccountContactsWithOutgoingRequests()
	const incoming = Chat.useAccountContactsWithIncomingRequests()
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
	const client = Chat.useClient()
	const [groupPk, setGroupPk] = useState('')
	const [mt, setMt] = useState([])
	const [ms, setMs] = useState([])
	return (
		<>
			<h2>Dump Group</h2>
			<input value={groupPk} placeholder='groupPK' onChange={(e) => setGroupPk(e.target.value)} />
			<button
				onClick={() => {
					const service = protocol.client.getService(client.id)
					const gpkBuf = Buffer.from(groupPk, 'base64')
					metadata = []
					messages = []
					const bridge = grpcBridge({ host: service.host, transport: service.transport })
					const grpcClient = new ProtocolServiceClient(bridge)
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

const Tools: React.FC = () => {
	return (
		<>
			<DumpGroup />
		</>
	)
}

type TabsDef = {
	Account: typeof Account
	Contacts: typeof Contacts
	Requests: typeof Requests
	Conversations: typeof Conversations
	Tools: typeof Tools
}

const TABS: TabsDef = {
	Account: Account,
	Contacts: Contacts,
	Requests: Requests,
	Conversations: Conversations,
	Tools: Tools,
}

const Tabs: React.FC = () => {
	const [selected, setSelected] = useState('Account')
	if (!(selected in TABS)) {
		return <>Error: Unknown tab {selected}</>
	}
	const TabContent = TABS[selected as keyof TabsDef]
	return (
		<>
			<div>
				{Object.keys(TABS).map((key) => (
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

const DEFAULT_TEST_NOTIF: notifications.Entity = { title: 'Title', message: 'Message' }

const NotifsTester: React.FC = () => {
	const [notif, setNotif] = useState(DEFAULT_TEST_NOTIF)
	const notify = Notifications.useNotify()
	return (
		<div>
			Test notifications:{' '}
			<input
				type='text'
				onChange={(ev) => setNotif({ ...notif, title: ev.target.value })}
				value={notif.title}
			/>
			<input
				type='text'
				onChange={(ev) => setNotif({ ...notif, message: ev.target.value })}
				value={notif.message}
			/>
			<button onClick={() => notify(notif)}>Notify</button>
		</div>
	)
}

// bridge notif from redux to react notifications
const NotificationsBridge: React.FC = () => {
	const notif = Notifications.useLastNotification()
	useEffect(() => {
		console.log('notif', notif)
		if (notif) {
			reactNotifStore.addNotification({
				title: notif.title,
				message: notif.message,
				type: 'success',
				insert: 'bottom',
				container: 'bottom-left',
				animationIn: ['animated', 'fadeIn'],
				animationOut: ['animated', 'fadeOut'],
				dismiss: {
					duration: 5000,
					onScreen: true,
				},
			})
		}
	}, [notif])
	return null
}

function App() {
	return (
		<Chat.Provider config={{ storage }}>
			<ReactNotification />
			<NotificationsBridge />

			<div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
				<h1>Berty web dev</h1>
				<ClearStorage />
				<NotifsTester />
				<AccountGate>
					<Tabs />
				</AccountGate>
			</div>
		</Chat.Provider>
	)
}

export default App
