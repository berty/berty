import beapi from '@berty/api'

import { IAccountServiceMock } from '../mockedServicesInterfaces.gen'
import { getGoldenData } from './goldenData'

export class AccountServiceMock implements Partial<IAccountServiceMock> {
	appStorage: { [key: string]: Uint8Array } = {}
	openedAccount: string | undefined

	AppStorageGet = async (request: beapi.account.AppStorageGet.IRequest) => {
		return { value: this.appStorage[request.key || ''] }
	}

	AppStoragePut = async (request: beapi.account.AppStoragePut.IRequest) => {
		if (request.value) {
			this.appStorage[request.key || ''] = request.value
		} else {
			delete this.appStorage[request.key || '']
		}
		return {}
	}

	AppStorageRemove = async (request: beapi.account.AppStorageRemove.IRequest) => {
		delete this.appStorage[request.key || '']
		return {}
	}

	GetUsername = async (_request: beapi.account.GetUsername.IRequest) => {
		return { username: 'Debug Mock' }
	}

	NetworkConfigGet = async (_request: beapi.account.NetworkConfigGet.IRequest) => {
		return {}
	}

	NetworkConfigSet = async (_request: beapi.account.NetworkConfigSet.IRequest) => {
		return {}
	}

	ListAccounts = async (_request: beapi.account.ListAccounts.IRequest) => {
		return {
			accounts: [getGoldenData().accountMetadata],
		}
	}

	GetOpenedAccount = async (_request: beapi.account.GetOpenedAccount.IRequest) => {
		if (this.openedAccount !== undefined) {
			return {
				accountId: this.openedAccount,
				listeners: ['/mock'],
			}
		}
		return {}
	}

	OpenAccountWithProgress = async (
		request: beapi.account.OpenAccountWithProgress.IRequest,
		send: (reply: beapi.account.OpenAccountWithProgress.IReply) => Promise<void>,
	) => {
		if (typeof request.accountId !== 'string') {
			throw new Error('invalid account id')
		}
		if (request.accountId !== getGoldenData().accountMetadata.accountId) {
			throw new Error('unknown account id')
		}
		this.openedAccount = request.accountId
		await send({ progress: { state: 'done' } })
	}

	CloseAccountWithProgress = async (
		_request: beapi.account.CloseAccountWithProgress.IRequest,
		send: (reply: beapi.account.CloseAccountWithProgress.IReply) => Promise<void>,
	) => {
		this.openedAccount = undefined
		await send({ progress: { state: 'done' } })
	}
}
