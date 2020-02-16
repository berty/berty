import { eddsa as EdDSA } from 'elliptic'
import { Buffer } from 'buffer'

export const ec = new EdDSA('ed25519')

const randomBytes = (count: number): Buffer => {
	/// NOT secure
	if (count <= 0) {
		throw new Error(`Invalid count ${count}`)
	}
	const buf = new Buffer(count)
	for (let i = 0; i < count; i++) {
		buf[i] = Math.floor(Math.random() * 256)
	}
	return buf
}

export interface AsymmetricKey {
	getPublic(): Buffer
	getSecret(): Buffer
}

export class KeyPair implements AsymmetricKey {
	secret: Buffer
	public: Buffer
	constructor(secret?: Buffer) {
		if (!secret) {
			this.secret = randomBytes(32)
		} else {
			this.secret = secret
		}
		this.public = new Buffer(ec.keyFromSecret(this.secret).getPublic())
	}
	getPublic() {
		return this.public
	}
	getSecret() {
		return this.secret
	}
}

export class PublicKey implements AsymmetricKey {
	value: Buffer
	constructor(value: Buffer) {
		this.value = value
	}
	getPublic() {
		return this.value
	}
	getSecret() {
		throw new Error("Can't get a private key from a public key")
		// eslint-disable-next-line no-unreachable
		return new Buffer(0)
	}
}

export class AsymmetricKeystore {
	keys: Map<string, AsymmetricKey>
	constructor() {
		this.keys = new Map()
	}
	get(keyName: string) {
		const kp = this.keys.get(keyName)
		if (!kp) {
			throw new Error(`Unknown key "${keyName}"`)
		}
		return kp
	}
	createKeyPair = (keyName: string) => {
		this.keys.set(keyName, new KeyPair())
	}
}
