package node

type SortableDeviceInfos []*DeviceInfo

func (a SortableDeviceInfos) Len() int           { return len(a) }
func (a SortableDeviceInfos) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a SortableDeviceInfos) Less(i, j int) bool { return a[i].Key < a[j].Key }
