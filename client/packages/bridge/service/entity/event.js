import pbjs from 'protobufjs/light'
import jsonDescriptor from './event.pb.json'

const root = pbjs.Root.fromJSON(jsonDescriptor)
export const Event = root.lookup('berty.entity.Event')
export default Event
