// +build android

package core

import (
	"Java/chat/berty/ble/Manager"
	"fmt"
)

func JavaExportTestFunc() {
	fmt.Printf("LALALALLA %+v\n\n\n", Manager.GetInstance())
}

func JavaCallTestFunc() {
	fmt.Printf("REAL SHIT %+v\n\n\n\n\n", Manager.GetInstance().RealTest())
}
