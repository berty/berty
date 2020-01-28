/*jest style test */

import * as chat from '..'
const { reducer } = chat.init()

const equality = function equality(result, nextState) {
	return JSON.stringify(result) === JSON.stringify(nextState)
}
const actions = [
	{
		action: {
			type: 'chat/account/command/create',
			payload: {
				name: 'Anonymous 1337',
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'protocol/client/command/instanceInitiateNewAccount',
			payload: {
				id: 0,
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'chat/account/event/created',
			payload: {
				aggregateId: 0,
				name: 'Anonymous 1337',
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'protocol/client/command/appSendPermanentMessage',
			payload: {
				id: 0,
				groupPk: '',
				payload: {
					type: 'chat/account/event/created',
					payload: {
						aggregateId: 0,
						name: 'Anonymous 1337',
					},
				},
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'protocol/client/event/instanceInitiatedNewAccount',
			payload: {
				aggregateId: 0,
				accountGroupPk:
					'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
				accountDevicePk:
					'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'protocol/client/command/appSendPermanentMessage',
			payload: {
				id: 0,
				groupPk:
					'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
				payload: {
					type: 'protocol/client/event/instanceInitiatedNewAccount',
					payload: {
						aggregateId: 0,
						accountGroupPk:
							'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
						accountDevicePk:
							'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
					},
				},
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'chat/account/event/pubkeyUpdated',
			payload: {
				aggregateId: 0,
				pubkey:
					'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey: '',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'protocol/client/command/groupSecureMessageSubscribe',
			payload: {
				id: 0,
				groupPk:
					'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
	{
		action: {
			type: 'protocol/client/command/appSendPermanentMessage',
			payload: {
				id: 0,
				groupPk:
					'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
				payload: {
					type: 'chat/account/event/pubkeyUpdated',
					payload: {
						aggregateId: 0,
						pubkey:
							'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
					},
				},
			},
		},
		prevState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							accountGroupPk:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							accountDevicePk:
								'2449acab00c8babb46af59a2a5ad0f0a0ced3fad436abee048bdc051e606b395cb155ec33b96db6214a8d770f50013d6c9a03b848d279dda7e6f0bc0d3123fd792ab10f545f30fbf730e7ca189a871b073a137135de7c98e6e4df58aef5d79a55cff4d28f191fff6747fe28618de3852b212c8d291db3735eeda5c5522cde359',
						},
					},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							pubkey:
								'e4a20a393506675aa79333435ba19f5cdb905a6bbfc94669b32aa37e7b152b3a7b33b382754b1229bccc6c1d2c2992697f961e64499ad411628ececaf4658307983bd6e89cf442abc62122403c018d267662d7262f601d3af8c44881f651e81f1407212689ebf42eeb78c891a7b55d8c7fe057c5f1385d798f42a1c9b038a4c5',
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					events: [],
					aggregates: {},
				},
				contact: {
					events: [],
					aggregates: {},
				},
				conversation: {
					events: [],
					aggregates: {},
				},
				member: {
					events: [],
					aggregates: {},
				},
				message: {
					events: [],
					aggregates: {},
				},
			},
		},
	},
]

test('chat/account/command/create (action index 0) should correctly update state', function() {
	const action = actions[0]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('protocol/client/command/instanceInitiateNewAccount (action index 1) should correctly update state', function() {
	const action = actions[1]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('chat/account/event/created (action index 2) should correctly update state', function() {
	const action = actions[2]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('protocol/client/command/appSendPermanentMessage (action index 3) should correctly update state', function() {
	const action = actions[3]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('protocol/client/event/instanceInitiatedNewAccount (action index 4) should correctly update state', function() {
	const action = actions[4]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('protocol/client/command/appSendPermanentMessage (action index 5) should correctly update state', function() {
	const action = actions[5]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('chat/account/event/pubkeyUpdated (action index 6) should correctly update state', function() {
	const action = actions[6]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('protocol/client/command/groupSecureMessageSubscribe (action index 7) should correctly update state', function() {
	const action = actions[7]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('protocol/client/command/appSendPermanentMessage (action index 8) should correctly update state', function() {
	const action = actions[8]
	const result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})
