import pbjs from 'protobufjs/light'
import jsonDescriptor from './service.pb.json'

// create daemon service
const root = pbjs.Root.fromJSON(jsonDescriptor)
export const ServiceName = 'berty.node.Service'
export const service = root.lookup(ServiceName)
console.log('nodeapi', service)
