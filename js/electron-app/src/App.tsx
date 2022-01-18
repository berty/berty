import React, {useCallback, useState} from 'react';
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

function App() {
	const [accountServerAddress, setAccountServerAddress] = useState('http://localhost:9092')
	const [accountClient, setAccountClient] = useState<WelshAccountServiceClient | null>(null)
	const [messengerClient, setMessengerClient] = useState<WelshMessengerServiceClient | null>(null)
	const [protocolClient, setProtocolClient] = useState<WelshProtocolServiceClient | null>(null)

	const [accounts, setAccounts] = useState<beapi.account.IAccountMetadata[]>([])
	const [currentAccount, setCurrentAccount] = useState<beapi.account.IAccountMetadata | null>(null)
	const [accountNameToCreate, setAccountNameToCreate] = useState('')
	const [accountProgress, setAccountProgress] = useState([0, 0])
	const [error, setError] = useState<Error | null>(null)

	const createAccount = useCallback(async () => {
		const result = await accountClient?.createAccount({accountName: accountNameToCreate}) as beapi.account.CreateAccount.Reply

		return connectToProtocolAndMessengerServices('http://localhost:9092', result.accountMetadata!)
	}, [accountClient, accountNameToCreate])

	const closeAccount = useCallback(async () => {
		if (!accountClient) {
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
							console.log(err.error)
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
	}, [accountClient, setCurrentAccount])

	const connectToAccount = useCallback(async (account: beapi.account.IAccountMetadata) => {
		setError(null)

		return new Promise((resolve, reject) => accountClient?.openAccountWithProgress({accountId: account.accountId})
			.then(async stream => {
				stream.onMessage((msg, err) => {
					if (err?.EOF) {
						console.log('activating persist with account:', account.accountId?.toString())
						resolve(null)
						setAccountProgress([0, 0])
						return
					}
					if (err && !err.OK) {
						console.warn('open account error:', err)
						setError(err)
						reject(err)
						setAccountProgress([0, 0])
						return
					}
					const progress = msg?.progress
					if (progress) {
						setAccountProgress([progress.completed, progress.total])
					}
				})
				await stream.start()

				setAccountProgress([0, 0])
				await new Promise(r => setTimeout(r, 4000))
				await connectToProtocolAndMessengerServices('http://localhost:9091', account)
				resolve(account)
				console.log('node is opened')
			})).catch(e => console.error(e))
	}, [accountClient, setCurrentAccount, setAccountProgress])

	const connectToAccountService = useCallback(async () => {
		try {
			const opts = {
				transport: grpc.CrossBrowserHttpTransport({withCredentials: false}),
				host: accountServerAddress,
			}

			const service = Service(beapi.account.AccountService, rpcWeb(opts)) as unknown as WelshAccountServiceClient
			const accounts = await service.listAccounts({})

			setAccounts(accounts.accounts || [])
			setAccountClient(service)
		} catch (e) {
			setError(e as Error)
		}
	}, [setAccountClient, accountServerAddress])

	const connectToProtocolAndMessengerServices = useCallback(async (url: string, account :beapi.account.IAccountMetadata) => {
		try {
			const opts = {
				transport: grpc.CrossBrowserHttpTransport({withCredentials: false}),
				host: url,
			}

			const protocolService = Service(beapi.protocol.ProtocolService, rpcWeb(opts)) as unknown as WelshProtocolServiceClient
			console.log(await protocolService.systemInfo({}))

			setProtocolClient(protocolService)

			const messengerService = Service(beapi.messenger.MessengerService, rpcWeb(opts)) as unknown as WelshMessengerServiceClient
			setMessengerClient(messengerService)

			setCurrentAccount(account)
		} catch (e) {
			setError(e as Error)
		}
	}, [setMessengerClient, setProtocolClient])

	return (
		<div className="App">
			<header className="App-header">
				{error &&
					<p style={{color: 'red'}}>Error : {JSON.stringify(error)}</p>}
				{!accountClient && <>
					<label htmlFor={'account-server-address'}>Account server
						address</label>
					<input value={accountServerAddress} onChange={e => setAccountServerAddress(e.target.value)} id={'account-server-address'} />
					<button onClick={connectToAccountService}>Connect to account server
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
			</header>
		</div>
	);
}

export default App;
