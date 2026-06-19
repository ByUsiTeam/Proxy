package tcp

import (
	"bufio"
	"crypto/tls"
	"io"
	"net"
	"proxy-client-golang/Protol"
	"strconv"
)

type TcpConnection struct {
}

func NewTcpConnection() *TcpConnection {
	return &TcpConnection{}
}

func (connection *TcpConnection) Connect(host string, port int, redType bool, handler Handler, call func(mgs string)) net.Conn {
	return connection.ConnectWithTLS(host, port, redType, handler, call, nil)
}

func (connection *TcpConnection) ConnectWithTLS(host string, port int, redType bool, handler Handler, call func(mgs string), tlsConfig *tls.Config) net.Conn {
	var conn net.Conn
	var err error

	if tlsConfig != nil {
		// TLS连接
		conn, err = tls.Dial("tcp", host+":"+strconv.Itoa(port), tlsConfig)
	} else {
		// 普通TCP连接
		conn, err = net.Dial("tcp", host+":"+strconv.Itoa(port))
	}

	if err != nil {
		if redType {
			call("不能能连到穿透服务器：" + host + ":" + strconv.Itoa(port) + " 原因：" + err.Error())
		} else {
			call("不能能连到内网服务器：" + host + ":" + strconv.Itoa(port) + " 原因：" + err.Error())
		}
		return nil
	}

	if tlsConfig != nil {
		if tlsConn, ok := conn.(*tls.Conn); ok {
			if err := tlsConn.Handshake(); err != nil {
				call("TLS握手失败：" + err.Error())
				tlsConn.Close()
				return nil
			}
		}
	}

	handler.ChannelActive(conn)
	//设置读
	go func() {
		reader := bufio.NewReader(conn)
		for {
			//尝试读检查连接激活
			_, err := reader.Peek(1)
			if err != nil {
				handler.ChannelInactive(conn)
				return
			}
			if redType {
				decode, e := Protol.Decode(reader)
				if e != nil {
					call(e.Error())
					handler.ChannelInactive(conn)
					return
				}
				if decode != nil {
					handler.ChannelRead(conn, decode)
				}

			} else {
				if reader.Buffered() > 0 {
					data := make([]byte, reader.Buffered())
					io.ReadFull(reader, data)
					handler.ChannelRead(conn, data)
				}
			}
		}
	}()
	return conn
}
