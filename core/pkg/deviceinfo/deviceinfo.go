package deviceinfo

import "sort"

type SortableDeviceInfos []*DeviceInfo

func (a SortableDeviceInfos) Len() int           { return len(a) }
func (a SortableDeviceInfos) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a SortableDeviceInfos) Less(i, j int) bool { return a[i].Key < a[j].Key }

func FromMap(entries map[string]string) *DeviceInfos {
	output := &DeviceInfos{}
	for key, value := range entries {
		output.Infos = append(
			output.Infos,
			&DeviceInfo{
				Key:   key,
				Value: value,
			},
		)

	}

	sort.Sort(sort.Reverse(SortableDeviceInfos(output.Infos))) // temporary reverse sorting to have interesting informatoin on top
	return output
}
