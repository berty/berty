import React, { useState } from 'react'
import { Chat } from '@berty-tech/hooks'
import { protocol } from '@berty-tech/store'
import './App.css'
import storage from 'redux-persist/lib/storage'

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
			<button onClick={() => createAccount({ name, bridgePort: port })}>Create account</button>
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
	return <div style={{ textAlign: message.isMe ? 'left' : 'right' }}>{message.body}</div>
}

const Conversation: React.FC<{ convId: string }> = ({ convId }) => {
	const conv = Chat.useGetConversation(convId)
	const sendMessage = Chat.useMessageSend()
	const [message, setMessage] = useState('')
	return (
		!!conv && (
			<>
				{conv.title}
				<br />
				<JSONed value={conv} />
				<div style={{ display: 'flex', flexDirection: 'column' }}>
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
					<button onClick={() => sendMessage({ type: 'UserMessage', body: message, id: convId })}>
						Send
					</button>
				)}
			</>
		)
	)
}

const Conversations: React.FC = () => {
	const conversations = Chat.useConversationList()
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
					service.groupMessageList({ groupPk: gpkBuf }, (...args: any[]) => {
						if (args[1]?.message) {
							const msg = JSON.parse(Buffer.from(args[1].message).toString('utf-8'))
							console.log('message:', msg)
							args[1] = { ...args[1], message: msg }
						}
						messages = [...messages, args]
						setMs(messages)
						console.log('messages callback', ...args)
					})
					service.groupMetadataList({ groupPk: gpkBuf }, (...args: any[]) => {
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

function App() {
	return (
		<Chat.Provider config={{ storage }}>
			<div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
				<h1>Berty web dev</h1>
				<ClearStorage />
				<AccountGate>
					<Tabs />
				</AccountGate>
			</div>
		</Chat.Provider>
	)
}

export default App
