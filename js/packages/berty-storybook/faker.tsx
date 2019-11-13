import React from 'react'
import once from 'once'
import faker from 'faker'

export const promiseResolved = (): Promise<void> => new Promise((res): any => setTimeout(res, 1000))
// export const promiseRejected = (): Promise<void> =>
//   new Promise((res, rej): Timeout => setTimeout(rej, 1000))

export const randomItem = (arr: Array<T>): T => arr[Math.floor(Math.random() % arr.length)]
export const randomLength = (): number => Math.floor((Math.random() % 10) + 10)
export const randomArray = <T extends unknown>(): Array<T> => new Array(randomLength()).fill({})

export const generateRequests = () => ({
	items: randomArray().map(() => ({
		name: faker.name.findName(),
		avatar: faker.internet.avatar(),
		at: faker.date.recent(),
		accept: promiseResolved,
		discard: promiseResolved,
	})),
})

export const generateConversations = () => ({
	items: randomArray().map(() => ({
		avatar: faker.internet.avatar(),
		title: randomItem([faker.name.findName, faker.name.title])(),
		intro: 'You have a new message',
		at: faker.date.recent(),
		badge: Math.random() % 100,
		verified: randomItem([true, false]),
		status: [0, 1, 2, 3][Math.random() % 4],
	})),
})

export const generateUsers = () => ({
	items: randomArray().map(() => ({
		avatarUri: faker.internet.avatar(),
		name: faker.name.findName(),
	})),
})

export const generateOneUser = () => ({
	avatarUri: faker.internet.avatar(),
	name: faker.name.findName(),
})

export const fakeRequests = generateRequests()
export const fakeConversations = generateConversations()
export const fakeUsers = generateUsers()
export const fakeOneUser = generateOneUser()

export const defaultFakeContext = {
	requests: fakeRequests,
	conversations: fakeConversations,
}

export const FakeContext = React.createContext(defaultFakeContext)
