import pbjs from 'protobufjs/light'
import jsonDescriptor from './kind.pb.json'

const root = pbjs.Root.fromJSON(jsonDescriptor)
export const Kind = root.lookup('berty.entity.Kind')
export default Kind
