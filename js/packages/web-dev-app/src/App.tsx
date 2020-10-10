import React, { useState, useRef, useLayoutEffect } from 'react'
import './App.css'
import { MsgrContext, useMsgrContext } from '@berty-tech/store/context'
import { MsgrProvider } from '@berty-tech/store/provider'
import {
	useAccountContactSearchResults,
	useFirstConversationWithContact,
	useContactsList,
	useConversationList
} from '@berty-tech/store/hooks'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { messenger as messengerpb } from '@berty-tech/api/index.js'

const CreateAccount: React.FC = () => {
	const [name, setName] = useState('')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MsgrContext)
	const handleCreate = React.useCallback(() => {
		setError(null)
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
			<Error value={error} />
			<button onClick={handleCreate}>Update account</button>
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
	return ctx.account && ctx.account.displayName !== '' ? (
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
		setError(null)
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

const ContactSearchResultLastMessage: React.FC<{ convId: string }> = ({ convId }) => {
	const ctx = React.useContext(MsgrContext)
	const intes = (ctx.interactions as any)[convId]
	if (!intes) {
		return null
	}
	const messages = Object.values(intes).filter(
		(inte: any) => inte.isMe && inte.type === messengerpb.AppMessage.Type.TypeUserMessage,
	)
	if (messages.length <= 0) {
		return null
	}
	const lastMessage = messages[messages.length - 1] as any
	return <JSONed value={{ body: lastMessage?.payload?.body }} />
}

const ContactSearchResult: React.FC<{ contact: any }> = ({ contact }) => {
	const firstConversationWithContact = useFirstConversationWithContact(contact.publicKey)

	return (
		<>
			<h4>Last sent message sent by me</h4>
			<ContactSearchResultLastMessage convId={contact.conversationPublicKey} />
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
					contactSearchResults.map((contact: any) => {
						return <ContactSearchResult contact={contact} key={contact.publicKey} />
					})}
			</div>
		</>
	)
}

const AcceptButton: React.FC<{ publicKey: string }> = ({ publicKey }) => {
	const ctx = React.useContext(MsgrContext)
	const [error, setError] = React.useState(null)
	const handleAccept = React.useCallback(() => {
		setError(null)
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

// TODO: use acknowledeged flag on Interaction
const isAcknowledged = (ctx: any, cid: string) =>
	!!Object.values(ctx.interactions).find((convIntes: any[]) =>
		Object.values(convIntes).find(
			(inte) =>
				inte.type === messengerpb.AppMessage.Type.TypeAcknowledge && cid === inte.payload.target,
		),
	)

const Interaction: React.FC<{ value: any }> = ({ value }) => {
	const ctx = React.useContext(MsgrContext)
	console.log('render inte', value)

	const [error, setError] = useState(null)
	const handleJoin = React.useCallback(({ link}) => {
		setError(null)
		ctx.client.conversationJoin({ link }).catch((err: any) => setError(err))
	}, [ctx.client])
	const conversations = useConversationList()

	if (value.type === messengerpb.AppMessage.Type.TypeUserMessage) {
		const payload = value.payload
		return (
			<div style={{ textAlign: value.isMe ? 'right' : 'left' }}>
				{value.isMe && isAcknowledged(ctx, value.cid) && '✓ '}
				{payload.body}
			</div>
		)
	} else if (value.type === messengerpb.AppMessage.Type.TypeGroupInvitation) {
		const payload = value.payload
		return (
			<div style={{ textAlign: value.isMe ? 'right' : 'left' }}>
				{value.isMe ? 'Sent group invitation!' : 'Received group invitation!'}
				{!value.isMe && <button onClick={() => handleJoin({link: payload.link})} disabled={conversations.find(c => c.link === payload.link)}>Accept</button>}
				<Error value={error}/>
			</div>
		)
	}
	return null
}

const Conversation: React.FC<{ publicKey: string }> = ({ publicKey }) => {
	const ctx = React.useContext(MsgrContext)
	const conv = (ctx.conversations as any)[publicKey] || {}
	const displayName = conv.displayName || (ctx.contacts as any)[conv.contactPublicKey]?.displayName || '<undefined displayName>'
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
		setError(null)
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
				{displayName}
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

const Conversations: React.FC = () => {
	const ctx = React.useContext(MsgrContext)
	const conversations = React.useMemo(
		() => [...Object.values(ctx.conversations)], // TODO: add sortDate
		[ctx.conversations],
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
							{conv.displayName || (ctx.contacts as any)[conv.contactPublicKey]?.displayName || '<undefined displayName>'}
						</button>
					)
				})}
			</div>
			{!!selected && <Conversation publicKey={selected} />}
		</>
	)
}

const Search: React.FC = () => {
	return (
		<>
			<h3>Search Contacts</h3>
			<SearchContacts />
		</>
	)
}

const Error: React.FC<{ value: Error }> = ({ value }) => (
	<span style={{ color: 'red' }}>{value && value.toString()}</span>
)

const CreateMultiMember = () => {
	const [groupName, setGroupName] = useState('My group')
	const [error, setError] = useState(null)
	const [members, setMembers] = useState([])
	const { refresh, error: errorReply, done } = (messengerMethodsHooks as any).useConversationCreate()
	const createGroup = React.useCallback(
		() => refresh({ displayName: groupName, contactsToInvite: members.map((m) => m.publicKey) }),
		[groupName, members, refresh],
	)
	const contactList = useContactsList()
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
		{contactList.filter((contact: any) => contact.state === messengerpb.Contact.State.Accepted).map((contact: any) => <button
		key={`${contact.publicKey}`}
		onClick={
			() => members.find(m => m.publicKey === contact.publicKey) ? setMembers(members.filter(member => member.publicKey !== contact.publicKey)) : setMembers([...members, contact])
			}>
			{contact.displayName}{' '}{members.find(m => m.publicKey === contact.publicKey) ? '🅧' : '+'}
			</button>)}
			<input
				type='text'
				value={groupName}
				onChange={(e) => {
					setGroupName(e.target.value)
				}}
			/>
			<Error value={error} />
			<button onClick={createGroup}>Create</button>
		</>
	)
}

const SendToAll: React.FC = () => {
	const [latestError, setLatestError] = useState(null)
	const [disabled, setDisabled] = useState(false)
	const ctx: any = React.useContext(MsgrContext)
	const convs: any[] = Object.values(ctx.conversations).filter(
		(conv: any) => conv.type === messengerpb.Conversation.Type.ContactType && !conv.fake,
	)
	const body = `Test, ${new Date(Date.now()).toLocaleString()}`
	const buf: string = messengerpb.AppMessage.UserMessage.encode({ body }).finish()
	const [sentToDisplayNames, setSentToDisplayNames] = useState([])

	const handleSend = React.useCallback(async () => {
		setSentToDisplayNames([])
		setDisabled(true)
		setLatestError(null)
		let names = []
		for (const conv of convs) {
			try {
				await ctx.client.interact({
					conversationPublicKey: conv.publicKey,
					type: messengerpb.AppMessage.Type.TypeUserMessage,
					payload: buf,
				})
			} catch (e) {
				setLatestError(e)
			}
			names.push(ctx.contacts[conv.contactPublicKey].displayName)
		}
		setSentToDisplayNames(names)
		setDisabled(false)
	}, [buf, convs, ctx.client, ctx.contacts])

	return (
		<div style={{ marginTop: '5%' }}>
			<button onClick={handleSend} disabled={disabled}>
				Send "<b>{body}</b>" to{' '}
				{convs.map((conv) => ctx.contacts[conv.contactPublicKey]?.displayName).join(' ')}
			</button>
			{sentToDisplayNames.length > 0 && (
				<>
					<h4>Message sent to:</h4>
					<JSONed value={sentToDisplayNames} />
				</>
			)}
			{latestError && <Error value={latestError} />}
		</div>
	)
}

const JoinMultiMember = () => {
	const [link, setLink] = useState('')
	const [error, setError] = useState(null)
	const ctx = React.useContext(MsgrContext)
	const handleJoin = React.useCallback(() => {
		setError(null)
		ctx.client.conversationJoin({ link }).catch((err: any) => setError(err))
	}, [ctx.client, link])
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
	const convs = Object.values(ctx.conversations).filter(
		(conv) => conv.type === messengerpb.Conversation.Type.MultiMemberType,
	)
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

const DumpStore: React.FC = () => {
	const ctx = useMsgrContext()
	return <JSONed value={ctx} />
}

const TABS = {
	Contacts: Contacts,
	Conversations: Conversations,
	Search: Search,
	MultiMember: MultiMember,
	DumpStore: DumpStore,
	SendToAll: SendToAll
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

const daemonAddrParamName = 'daemonAddress'

const StreamGate: React.FC = ({ children }) => {
	const ctx = React.useContext(MsgrContext)
	const exampleAddr = `${window.location.protocol}//${window.location.host}/?${daemonAddrParamName}=http://localhost:1337`
	if (ctx.streamError) {
		return (
			<>
				<p>
					<Error value={ctx.streamError} />
				</p>
				<p>
					Likely couldn't connect to the node, or the connection droped
					<br />
					You can change the node's address by using the "{daemonAddrParamName}" url parameter
					<br />
					Example: <a href={exampleAddr}>{exampleAddr}</a>
				</p>
			</>
		)
	}
	return <>{children}</>
}

function App() {
	const daemonAddress = getParam(daemonAddrParamName) || 'http://127.0.0.1:1337'

	return (
		<div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
			<h1>Berty web dev</h1>
			<p>Daemon address is "{daemonAddress}"</p>
			<MsgrProvider daemonAddress={daemonAddress}>
				<StreamGate>
					<ListGate>
						<Account />
						<AccountGate>
							<Tabs />
						</AccountGate>
					</ListGate>
				</StreamGate>
			</MsgrProvider>
		</div>
	)
}

export default App
