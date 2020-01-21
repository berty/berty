/*jest style test */

import * as chat from '..'
const { reducer } = chat.init()

var equality = function equality(result, nextState) {
	return JSON.stringify(result) === JSON.stringify(nextState)
}
var actions = [
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
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					logs: {},
					aggregates: {},
				},
				contact: {
					logs: {},
					aggregates: {},
				},
				conversation: {
					logs: {},
					aggregates: {},
				},
				member: {
					logs: {},
					aggregates: {},
				},
				message: {
					logs: {},
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					logs: {},
					aggregates: {},
				},
				contact: {
					logs: {},
					aggregates: {},
				},
				conversation: {
					logs: {},
					aggregates: {},
				},
				member: {
					logs: {},
					aggregates: {},
				},
				message: {
					logs: {},
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
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {},
				},
				request: {
					logs: {},
					aggregates: {},
				},
				contact: {
					logs: {},
					aggregates: {},
				},
				conversation: {
					logs: {},
					aggregates: {},
				},
				member: {
					logs: {},
					aggregates: {},
				},
				message: {
					logs: {},
					aggregates: {},
				},
			},
		},
		nextState: {
			protocol: {
				client: {
					aggregates: {},
				},
			},
			chat: {
				account: {
					events: [],
					aggregates: {
						'0': {
							id: 0,
							name: 'Anonymous 1337',
							requests: [],
							conversations: [],
							contacts: [],
						},
					},
				},
				request: {
					logs: {},
					aggregates: {},
				},
				contact: {
					logs: {},
					aggregates: {},
				},
				conversation: {
					logs: {},
					aggregates: {},
				},
				member: {
					logs: {},
					aggregates: {},
				},
				message: {
					logs: {},
					aggregates: {},
				},
			},
		},
	},
]

test('chat/account/command/create (action index 0) should correctly update state', function() {
	var action = actions[0]
	var result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})

test('chat/account/event/created (action index 1) should correctly update state', function() {
	var action = actions[1]
	var result = reducer(action.prevState, action.action)
	expect(equality(result, action.nextState)).toBe(true)
})
