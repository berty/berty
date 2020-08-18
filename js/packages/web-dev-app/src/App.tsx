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
import { MsgrProvider, MsgrContext } from './context'
import { messenger as messengerpb } from '@berty-tech/api/index.js'

const CreateAccount: React.FC = () => {
	const [name, setName] = useState('')
	const [error, setError] = useState(null)
	const [port, setPort] = useState(1337)
	const ctx = React.useContext(MsgrContext)
	const handleCreate = React.useCallback(() => {
		ctx.client.accountUpdate({ displayName: name }).catch((err: any) => setError(err))
	}, [ctx.client, name])
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

			<button onClick={handleCreate}>Create account</button>
		</>
	)
}

const Account: React.FC = () => {
	const ctx = React.useContext(MsgrContext)
	const account = ctx.account
	return (
		<>
			<h2>Account</h2>
			<JSONed value={account} />
		</>
	)
}

const AccountGate: React.FC = ({ children }) => {
	const ctx = React.useContext(MsgrContext)
	return ctx.account && ctx.account.state === messengerpb.Account.State.Ready ? (
		<>{children}</>
	) : (
		<CreateAccount />
	)
}

const AddContact: React.FC = () => {
	const [link, setLink] = useState('')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MsgrContext)
	const handleAdd = React.useCallback(() => {
		ctx.client.contactRequest({ link }).catch((err: any) => setError(err))
	}, [ctx.client, link])
	return (
		<>
			<h3>Add contact</h3>
			<input
				type='text'
				placeholder='Deep link'
				value={link}
				onChange={(e) => setLink(e.target.value)}
			/>
			<Error value={error} />
			<button onClick={handleAdd}>Add contact</button>
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

const AcceptButton: React.FC<{ publicKey: string }> = ({ publicKey }) => {
	const ctx = React.useContext(MsgrContext)
	const [error, setError] = React.useState(null)
	const handleAccept = React.useCallback(() => {
		ctx.client.contactAccept({ publicKey }).catch((err: any) => setError(err))
	}, [ctx.client, publicKey])
	return (
		<>
			<Error value={error} />
			<button onClick={handleAccept}>Accept</button>
		</>
	)
}

const Contacts: React.FC = () => {
	const ctx = React.useContext(MsgrContext)
	return (
		<>
			<h2>Contacts</h2>
			<AddContact />
			<h3>Contacts List</h3>
			<div style={{ display: 'flex', flexWrap: 'wrap' }}>
				{Object.values(ctx.contacts).map((contact: any) => (
					<div style={{ border: '1px solid black' }} key={contact.publicKey}>
						<JSONed value={contact} />
						{contact.state === messengerpb.Contact.State.IncomingRequest && (
							<AcceptButton publicKey={contact.publicKey} />
						)}
					</div>
				))}
			</div>
		</>
	)
}

const Interaction: React.FC<{ value: any }> = ({ value }) => {
	console.log('render inte', value)
	if (value.type === messengerpb.AppMessage.Type.TypeUserMessage) {
		const payload = value.payload
		return (
			<div style={{ textAlign: payload.isMe ? 'right' : 'left' }}>
				{payload.isMe && payload.acknowledged && '✓ '}
				{payload.body}
			</div>
		)
	}
	return null
}

const Conversation: React.FC<{ publicKey: string }> = ({ publicKey }) => {
	const ctx = React.useContext(MsgrContext)
	let conv = (ctx.conversations as any)[publicKey]
	if (!conv) {
		const contact: any = Object.values(ctx.contacts).find(
			(c: any) => c.conversationPublicKey === publicKey,
		)
		if (contact) {
			conv = { displayName: contact.displayName, publicKey, kind: '1to1' }
		}
	} else {
		conv = { ...conv, kind: 'multi' }
	}
	const interactions = Object.values((ctx.interactions as any)[publicKey] || {})
	const [message, setMessage] = useState('')
	const [error, setError] = useState(null)

	const usermsg = { body: message }
	console.log('sending', usermsg)
	const buf = messengerpb.AppMessage.UserMessage.encode(usermsg).finish()
	console.log('encoded', buf)
	const decoded = messengerpb.AppMessage.UserMessage.decode(buf)
	console.log('decoded', decoded)

	const handleSend = React.useCallback(() => {
		ctx.client
			.interact({
				conversationPublicKey: publicKey,
				type: messengerpb.AppMessage.Type.TypeUserMessage,
				payload: buf,
			})
			.catch((e: any) => setError(e))
	}, [buf, ctx.client, publicKey])

	const scrollRef = useRef<HTMLDivElement>(null)
	useLayoutEffect(() => {
		const div = scrollRef.current
		if (!div) return
		div.scrollTop = div.scrollHeight - div.clientHeight
	}, [])
	return (
		!!conv && (
			<>
				{conv.displayName}
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
					{(interactions || []).map((inte: any) => (
						<Interaction key={inte.cid} value={inte} />
					))}
				</div>
				<input
					type='text'
					placeholder='Type your message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				{!!message && <button onClick={handleSend}>Send</button>}
				<Error value={error} />
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
	const ctx = React.useContext(MsgrContext)
	const conversations = React.useMemo(
		() => [
			...Object.values(ctx.conversations),
			...Object.values(ctx.contacts)
				.filter((c: any) => c.state === messengerpb.Contact.State.Established)
				.map((c: any) => ({ publicKey: c.conversationPublicKey, displayName: c.displayName })),
		], // TODO: add sortDate
		[ctx.contacts, ctx.conversations],
	)
	const [selected, setSelected] = useState('')
	return (
		<>
			<h2>Conversations</h2>
			<div style={{ display: 'flex' }}>
				{conversations.map((conv: any) => {
					return (
						<button
							key={conv.publicKey}
							disabled={selected === conv.publicKey}
							onClick={() => setSelected(conv.publicKey)}
						>
							{conv.displayName}
						</button>
					)
				})}
			</div>
			{!!selected && <Conversation publicKey={selected} />}
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
			{Object.values(groups).map((group: any) => (
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

const Error: React.FC<{ value: Error }> = ({ value }) => (
	<div style={{ color: 'red' }}>{value && value.toString()}</div>
)

const CreateMultiMember = () => {
	const [groupName, setGroupName] = useState('My group')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MsgrContext)
	const handleCreate = React.useCallback(() => {
		ctx.client.conversationCreate({ displayName: groupName }).catch((err: any) => setError(err))
	}, [ctx.client, groupName])
	return (
		<>
			<input
				type='text'
				value={groupName}
				onChange={(e) => {
					setGroupName(e.target.value)
				}}
			/>
			<Error value={error} />
			<button onClick={handleCreate}>Create</button>
		</>
	)
}

const JoinMultiMember = () => {
	const [link, setLink] = useState('')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MsgrContext)
	const handleJoin = React.useCallback(() => {
		ctx.client.conversationJoin({ link }).catch((err: any) => setError(err))
	}, [ctx.client, link, setError])
	return (
		<>
			<input
				type='text'
				value={link}
				onChange={(e) => {
					setLink(e.target.value)
				}}
			/>
			<Error value={error} />
			<button onClick={handleJoin}>Join</button>
		</>
	)
}

const MultiMemberList = () => {
	const ctx = React.useContext(MsgrContext)
	const convs = Object.values(ctx.conversations)
	return (
		<>
			{convs.map((conv: any) => {
				return (
					<div key={conv.publicKey}>
						<h3>{conv.displayName}</h3>
						Public key: {conv.publicKey}
						<br />
						Link: {conv.link}
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
	Contacts: Contacts,
	Conversations: Conversations,
	Search: Search,
	MultiMember: MultiMember,
	Groups: Groups,
	Tools: Tools,
}

type TabKey = keyof typeof TABS

const TABS_KEYS = Object.keys(TABS) as TabKey[]

const Tabs: React.FC = () => {
	const [selected, setSelected] = useState<TabKey>('Contacts')
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

const ListGate: React.FC = ({ children }) => {
	const ctx = React.useContext(MsgrContext)
	if (ctx && ctx.listDone) {
		return <>{children}</>
	} else {
		return <>Loading..</>
	}
}

function getParam(sVar: string) {
	return unescape(
		window.location.search.replace(
			new RegExp(
				'^(?:.*[&\\?]' + escape(sVar).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$',
				'i',
			),
			'$1',
		),
	)
}

function App() {
	return (
		<MsgrProvider daemonAddress={getParam('daemonAddress') || 'http://127.0.0.1:1337'}>
			<div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
				<h1>Berty web dev</h1>
				<ListGate>
					<Account />
					<AccountGate>
						<Tabs />
					</AccountGate>
				</ListGate>
			</div>
		</MsgrProvider>
	)
}

export default App
