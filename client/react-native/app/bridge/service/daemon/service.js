import pbjs from 'protobufjs/light'
import jsonDescriptor from './daemon.pb.json'

// create daemon service
const daemonRoot = pbjs.Root.fromJSON(jsonDescriptor)
export const ServiceName = 'berty.daemon.Daemon'
export const service = daemonRoot.lookup(ServiceName)
