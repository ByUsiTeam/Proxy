package miao.byusi.hp.server.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.ServerSocket;

/**
 * @author hxm
 */
public class NetUtil {
    private static final Logger log = LoggerFactory.getLogger(NetUtil.class);

    /**
     * 获取一个可用的端口
     *
     * @return
     */
    public static int getAvailablePort() {
        ServerSocket serverSocket=null;
        try {
            serverSocket = new ServerSocket(0);
            return serverSocket.getLocalPort();
        } catch (Throwable ignored) {
        }finally {
            if (serverSocket!=null){
                try {
                    serverSocket.close();
                } catch (IOException e) {
                    log.error("关闭端口检测Socket失败", e);
                }
            }
        }
        return -1;
    }

}
