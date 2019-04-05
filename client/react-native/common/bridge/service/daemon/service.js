import pbjs from 'protobufjs/light'
import jsonDescriptor from './daemon.pb.json'

export const ServiceName = 'berty.daemon.Daemon'

// create daemon service
const daemonRoot = pbjs.Root.fromJSON(jsonDescriptor)
const daemonService = daemonRoot.lookup(ServiceName)

export default rpc => daemonService.create(rpc(ServiceName), false, false)
