import { errcode, account } from '@berty-tech/api'
import { reduce } from 'lodash'

class GRPCError extends Error {
	public EOF: boolean
	public OK: boolean
	public Code: errcode.ErrCode
	public GrpcCode: account.GRPCErrCode

	private error: account.Error

	constructor(e: account.IError | null | undefined) {
		if (!e) {
			// this should not happen, but should not break the app either.
			// instead simply create a empty error and warn about this
			console.warn(`GRPCError: (${e}) grpc error provided, empty error returned`)
			e = account.Error.create({})
		}

		const error = account.Error.create(e)
		super(error.message)

		this.error = error
		this.Code = error.errorCode
		this.GrpcCode = error.grpcErrorCode

		this.OK =
			error.grpcErrorCode === account.GRPCErrCode.OK &&
			error.errorCode === errcode.ErrCode.Undefined
		this.EOF =
			error.grpcErrorCode === account.GRPCErrCode.CANCELED ||
			(error.grpcErrorCode === account.GRPCErrCode.UNKNOWN && error.message === 'EOF')
	}

	public details(): errcode.ErrDetails {
		if (this.error.errorDetails) {
			return errcode.ErrDetails.create(this.error.errorDetails)
		}

		return errcode.ErrDetails.create({})
	}

	public errCode(): errcode.ErrCode {
		return this.Code
	}

	public grpcErrorCode(): account.GRPCErrCode {
		return this.GrpcCode
	}

	public hasErrCode(error: errcode.ErrCode): boolean {
		return reduce(this.error.errorDetails?.codes, (ac, v) => ac && v == error, false) || false
	}
}

const newGRPCError = (code: number, message: string): GRPCError => {
	const error = account.Error.fromObject({
		message: message,
		grpcErrorCode: code,
	})
	return new GRPCError(error)
}

const EOF = new GRPCError({
	grpcErrorCode: account.GRPCErrCode.CANCELED,
	message: 'EOF',
})

export {
	GRPCError,
	EOF,
	newGRPCError,
}
