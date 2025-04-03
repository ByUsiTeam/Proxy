package android

import (
	"proxy-client-golang/web"
)

func Start(apiAddress string, port int, coreVersion string, deviceId string) {
	web.InitCloudDevice(apiAddress, deviceId)
	web.StartWeb(port, coreVersion)
}
