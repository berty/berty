package deviceinfo

import (
	"encoding/json"
	"sort"
)

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

	output.sort()
	return output
}

func Merge(groups ...*DeviceInfos) *DeviceInfos {
	output := DeviceInfos{}

	for _, group := range groups {
		output.Infos = append(output.Infos, group.Infos...)
	}

	output.sort()
	return &output
}

func (d *DeviceInfos) sort() {
	sort.Sort(sort.Reverse(SortableDeviceInfos(d.Infos))) // temporary reverse sorting to have interesting informatoin on top
}

func (d *DeviceInfos) Add(new *DeviceInfo) {
	d.Infos = append(d.Infos, new)
}

func NewInfo(category, name string) *DeviceInfo {
	return &DeviceInfo{
		Category: category,
		Key:      name,
		Type:     Type_Unknown,
	}
}

func (d *DeviceInfo) SetJSON(thing interface{}) *DeviceInfo {
	//out, _ := json.MarshalIndent(thing, "", "  ")
	out, err := json.Marshal(thing)
	d.Value = string(out)
	d.Type = Type_Json
	if err != nil {
		d.ErrMsg = err.Error()
	}
	return d
}

func (d *DeviceInfo) SetString(content string) *DeviceInfo {
	d.Value = content
	d.Type = Type_Raw
	return d
}

func (d *DeviceInfo) SetError(err error) *DeviceInfo {
	if err != nil {
		d.ErrMsg = err.Error()
	}
	return d
}

func (d *DeviceInfo) SetURL(url string) *DeviceInfo {
	d.Link = url
	return d
}

type SortableDeviceInfos []*DeviceInfo

func (a SortableDeviceInfos) Len() int      { return len(a) }
func (a SortableDeviceInfos) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a SortableDeviceInfos) Less(i, j int) bool {
	if a[i].Category != a[j].Category {
		return a[i].Category < a[j].Category
	}
	if a[i].Weight != a[j].Weight {
		return a[i].Weight < a[j].Weight
	}
	if a[i].Key != a[j].Key {
		return a[i].Key < a[j].Key
	}
	return true
}
