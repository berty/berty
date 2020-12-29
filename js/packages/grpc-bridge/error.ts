import beapi from '@berty-tech/api'
import { reduce } from 'lodash'

class GRPCError extends Error {
	public EOF: boolean
	public OK: boolean
	public Code: beapi.errcode.ErrCode
	public GrpcCode: beapi.account.GRPCErrCode

	private error: beapi.account.Error

	constructor(e: beapi.account.IError | null | undefined) {
		if (!e) {
			// this should not happen, but should not break the app either.
			// instead simply create a empty error and warn about this
			console.warn(`GRPCError: (${e}) grpc error provided, empty error returned`)
			e = beapi.account.Error.create({})
		}

		const error = beapi.account.Error.create(e)
		super(error.message)

		this.error = error
		this.Code = error.errorCode
		this.GrpcCode = error.grpcErrorCode

		this.OK =
			error.grpcErrorCode === beapi.account.GRPCErrCode.OK &&
			error.errorCode === beapi.errcode.ErrCode.Undefined
		this.EOF =
			error.grpcErrorCode === beapi.account.GRPCErrCode.CANCELED ||
			(error.grpcErrorCode === beapi.account.GRPCErrCode.UNKNOWN && error.message === 'EOF')
	}

	public details(): beapi.errcode.ErrDetails {
		if (this.error.errorDetails) {
			return beapi.errcode.ErrDetails.create(this.error.errorDetails)
		}

		return beapi.errcode.ErrDetails.create({})
	}

	public errCode(): beapi.errcode.ErrCode {
		return this.Code
	}

	public grpcErrorCode(): beapi.account.GRPCErrCode {
		return this.GrpcCode
	}

	public hasErrCode(error: beapi.errcode.ErrCode): boolean {
		return reduce(this.error.errorDetails?.codes, (ac, v) => ac && v == error, false) || false
	}
}

const newGRPCError = (code: number, message: string): GRPCError => {
	const error = beapi.account.Error.fromObject({
		message: message,
		grpcErrorCode: code,
	})
	return new GRPCError(error)
}

const EOF = new GRPCError({
	grpcErrorCode: beapi.account.GRPCErrCode.CANCELED,
	message: 'EOF',
})

export { GRPCError, EOF, newGRPCError }
