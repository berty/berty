import { grpc } from '@improbable-eng/grpc-web'

export default () => grpc.CrossBrowserHttpTransport({ withCredentials: false })
