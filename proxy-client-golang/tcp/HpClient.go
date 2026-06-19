package tcp

import (
	"crypto/tls"
	"proxy-client-golang/hpMessage"
	"net"

	"strconv"
)

type HpClient struct {
	CallMsg       func(message string)
	conn          net.Conn
	serverAddress string
	serverPort    int
	isKill        bool
	handler       *HpClientHandler
	tlsConfig     *tls.Config
}

func NewHpClient(callMsg func(message string)) *HpClient {
	return &HpClient{
		CallMsg: callMsg,
	}
}

func (hpClient *HpClient) Connect(messageType hpMessage.HpMessage_MessageType, serverAddress string, serverPort int, username string, password string, domain string, remotePort int, proxyAddress string, proxyPort int) {
	hpClient.connectWithTLS(messageType, serverAddress, serverPort, username, password, domain, remotePort, proxyAddress, proxyPort, nil)
}

func (hpClient *HpClient) ConnectWithTLS(messageType hpMessage.HpMessage_MessageType, serverAddress string, serverPort int, username string, password string, domain string, remotePort int, proxyAddress string, proxyPort int, tlsConfig *tls.Config) {
	hpClient.connectWithTLS(messageType, serverAddress, serverPort, username, password, domain, remotePort, proxyAddress, proxyPort, tlsConfig)
}

func (hpClient *HpClient) connectWithTLS(messageType hpMessage.HpMessage_MessageType, serverAddress string, serverPort int, username string, password string, domain string, remotePort int, proxyAddress string, proxyPort int, tlsConfig *tls.Config) {
	if hpClient.conn != nil {
		hpClient.conn.Close()
	}
	connection := NewTcpConnection()
	handler := &HpClientHandler{
		Port:         remotePort,
		Password:     password,
		Username:     username,
		Domain:       domain,
		MessageType:  messageType,
		ProxyAddress: proxyAddress,
		ProxyPort:    proxyPort,
		CallMsg:      hpClient.CallMsg,
	}
	hpClient.serverAddress = serverAddress
	hpClient.serverPort = serverPort
	hpClient.handler = handler
	hpClient.tlsConfig = tlsConfig
	hpClient.conn = connection.ConnectWithTLS(serverAddress, serverPort, true, handler, hpClient.CallMsg, tlsConfig)
}

func (hpClient *HpClient) GetStatus() bool {
	if hpClient.handler != nil {
		return hpClient.handler.Active
	} else {
		return false
	}
}

func (hpClient *HpClient) IsKill() bool {
	return hpClient.isKill
}

func (hpClient *HpClient) GetProxyServer() string {
	return hpClient.handler.ProxyAddress + ":" + strconv.Itoa(hpClient.handler.ProxyPort)
}

func (hpClient *HpClient) GetServer() string {
	return hpClient.serverAddress + ":" + strconv.Itoa(hpClient.serverPort)
}

func (hpClient *HpClient) Kill() {
	hpClient.isKill = true
	hpClient.Close()
}

func (hpClient *HpClient) Close() {
	if hpClient.conn != nil {
		hpClient.conn.Close()
	}
	if hpClient.handler != nil {
		hpClient.handler.CloseAll()
	}
}
