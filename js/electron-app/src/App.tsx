import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {grpc} from '@improbable-eng/grpc-web'
import {Service} from '../../packages/grpc-bridge'
import beapi from '../../packages/api'
import {
	grpcweb as rpcWeb
} from '../../packages/grpc-bridge/rpc'
import {
	WelshAccountServiceClient,
	WelshMessengerServiceClient,
	WelshProtocolServiceClient
} from '../../packages/grpc-bridge/welsh-clients.gen'

const convertMAddr = (urls: String[]): (string | null) => urls.map((maddr: String) => {
		const ip = maddr.match(/\/ip([46])\/([^/]+)\/tcp\/([0-9]+)\/grpcws/)
		if (ip !== null) {
			const preIP = ip[1] === '6' ? '[' : ''
			const postIP = ip[1] === '6' ? ']' : ''

			return `http://${preIP}${ip[2]}${postIP}:${ip[3]}`
		}

		const hostname = maddr.match(/\/dns[46]\/([a-z0-9-.]+)\/tcp\/([0-9]+)\/grpcws/)
		if (hostname !== null) {
			return `http://${hostname[1]}:${hostname[2]}`

		}

		// TODO: support TLS

		return null
	})
		.reduce((prev: string | null, curr: string | null) => prev ? prev : curr, null)

function App() {
	const [accountServerAddress, setAccountServerAddress] = useState('')
	const [accountClient, setAccountClient] = useState<WelshAccountServiceClient | null>(null)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [messengerClient, setMessengerClient] = useState<WelshMessengerServiceClient | null>(null)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [protocolClient, setProtocolClient] = useState<WelshProtocolServiceClient | null>(null)
	const [sysInfo, setSysInfo] = useState<beapi.protocol.SystemInfo | null>(null)

	const [accounts, setAccounts] = useState<beapi.account.IAccountMetadata[]>([])
	const [currentAccount, setCurrentAccount] = useState<beapi.account.IAccountMetadata | null>(null)
	const [accountNameToCreate, setAccountNameToCreate] = useState('')
	const [accountProgress, setAccountProgress] = useState([0, 0])
	const [error, setError] = useState<Error | null>(null)

	const connectToProtocolAndMessengerServices = useCallback(async (account: beapi.account.IAccountMetadata) => {
		try {
			const openedAccount = await accountClient?.getOpenedAccount({})
			const url = convertMAddr(openedAccount?.listeners || [])

			if (url === null) {
				console.error('unable to find service address')
				return
			}

			const opts = {
				transport: grpc.CrossBrowserHttpTransport({withCredentials: false}),
				host: url,
			}

			const protocolService = Service(beapi.protocol.ProtocolService, rpcWeb(opts)) as unknown as WelshProtocolServiceClient
			setSysInfo(await protocolService.systemInfo({}))

			setProtocolClient(protocolService)

			const messengerService = Service(beapi.messenger.MessengerService, rpcWeb(opts)) as unknown as WelshMessengerServiceClient
			setMessengerClient(messengerService)

			setCurrentAccount(account)
		} catch (e) {
			setError(e as Error)
			console.error(e)
		}
	}, [setMessengerClient, setProtocolClient, setSysInfo, accountClient])

	const createAccount = useCallback(async () => {
		const result = await accountClient?.createAccount({
			accountName: accountNameToCreate,
			sessionKind: 'desktop-electron'
		}) as beapi.account.CreateAccount.Reply

		const accounts = await accountClient?.listAccounts({})

		setAccounts(accounts.accounts || [])

		return connectToProtocolAndMessengerServices(result.accountMetadata!)
	}, [accountClient, accountNameToCreate, connectToProtocolAndMessengerServices])

	const closeAccount = useCallback(async () => {
		if (!accountClient) {
			console.warn('no account client')
			return
		}

		setError(null)

		accountClient!
			.closeAccountWithProgress({})
			.then(async stream => {
				stream.onMessage((msg, err) => {
					if (err) {
						if (err.EOF) {
							console.log('Node is closed')
						} else if (!err.OK) {
							console.warn('Error while closing node:', err)
							console.error(err.error)
							setError(err)
						}
						setAccountProgress([0, 0])
						return
					}
					const progress = msg?.progress
					if (progress) {
						setAccountProgress([progress.completed, progress.total])
					}
				})
				await stream.start()

				setCurrentAccount(null)
				setAccountProgress([0, 0])
			})
	}, [setCurrentAccount, accountClient])

	const connectToAccount = useCallback(async (account: beapi.account.IAccountMetadata) => {
		setError(null)

		try {
			await new Promise((resolve, reject) => accountClient?.openAccountWithProgress({
				accountId: account.accountId,
				sessionKind: 'desktop-electron'
			})
				.then(async stream => {
					stream.onMessage((msg, err) => {
						if (err?.EOF) {
							console.log('activating persist with account:', account.accountId?.toString())
							resolve(null)
							return
						}
						if (err && !err.OK) {
							console.error('open account error:', err)
							setError(err)
							reject(null)
							return
						}
						if (msg?.progress?.state !== 'done') {
							const progress = msg?.progress
							if (progress) {
								setAccountProgress([progress.completed, progress.total])
							}
						} else if (msg?.progress?.state === 'done') {
							resolve(null)
						}
					})
					await stream.start()
				}))

			setAccountProgress([0, 0])
			setCurrentAccount(account)
			await connectToProtocolAndMessengerServices(account)
		} catch (err) {
			setError(err as Error)
			console.error(err)
		}
	}, [accountClient, setAccountProgress, connectToProtocolAndMessengerServices])

	const connectToAccountService = useCallback(async (addr: string) => {
		try {
			const opts = {
				transport: grpc.CrossBrowserHttpTransport({withCredentials: false}),
				host: addr,
			}

			const service = Service(beapi.account.AccountService, rpcWeb(opts)) as unknown as WelshAccountServiceClient
			const accounts = await service.listAccounts({})

			setAccounts(accounts.accounts || [])
			setAccountClient(service)
		} catch (e) {
			console.error(e)
			setError(e as Error)
		}
	}, [setAccountClient])

	useEffect(() => {
		const defaultMAddr = convertMAddr([window.location.hash.substr(1) || ''])
		if (defaultMAddr === null) {
			return
		}

		setAccountServerAddress(defaultMAddr)
		connectToAccountService(defaultMAddr).catch(e => console.error(e))
	}, [connectToAccountService])

	return (
		<div className="App">
			<header className="App-header">
				{error &&
					<p style={{color: 'red'}}>Error : {JSON.stringify(error)}</p>}
				{!accountClient && <>
					<label htmlFor={'account-server-address'}>Account server
						address</label>
					<input value={accountServerAddress} onChange={e => setAccountServerAddress(e.target.value)} id={'account-server-address'} />
					<button onClick={() => connectToAccountService(accountServerAddress)}>Connect to account server
					</button>
				</>}
				{accountClient && !currentAccount && (<>
					<button onClick={() => {
						setAccountClient(null)
						setCurrentAccount(null)
					}}>Disconnect from account service {accountServerAddress}</button>
					<button onClick={closeAccount}>Close opened account</button>
				</>)
				}
				{accountClient && accounts && currentAccount === null && <div>
					{accounts.map(a => (
						<div key={a.accountId}>{a.accountId} = {a.name}
							<button onClick={() => connectToAccount(a)}>Connect</button>
						</div>
					))}
					{accounts.length === 0 && <div>No account currently exist</div>}
					<label htmlFor={'create-account-name'}>Name of account to
						create</label>
					<input value={accountNameToCreate} onChange={e => setAccountNameToCreate(e.target.value)} id={'create-account-name'} />
					<button onClick={createAccount}>Create account</button>
				</div>}

				{accountClient && currentAccount && <button onClick={async () => {
					await closeAccount()
				}}>Disconnect from
					account {currentAccount.name} ({currentAccount.accountId})</button>}
				{accountClient && !currentAccount && accountProgress[0] !== accountProgress[1] &&
					<p>Performing account
						operations {accountProgress[0]}/{accountProgress[1]}</p>}
				<pre style={{
					maxWidth: '300px',
					fontSize: '20px',
					whiteSpace: 'pre-wrap'
				}}>{JSON.stringify(sysInfo?.toJSON())}</pre>
			</header>
		</div>
	);
}

export default App;
