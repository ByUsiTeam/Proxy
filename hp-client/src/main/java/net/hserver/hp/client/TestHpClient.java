package net.hserver.hp.client;

import net.hserver.hp.client.hp.CallMsg;
import net.hserver.hp.client.hp.HpClient;
import net.hserver.hp.common.protocol.HpMessageData;

/**
 * @author hxm
 */
public class TestHpClient {

    public static void main(String[] args) throws Exception {
            HpClient client = new HpClient(new CallMsg() {
                @Override
                public void message(String msg) {
                    System.out.println(msg);
                }
            });

            client.connect(HpMessageData.HpMessage.MessageType.UDP, "proxy.byusi.cn", 9091, "666666", "666666", "asdx", -1, "127.0.0.1", 7777);
            Thread.sleep(2000);

            while (true){
                System.out.println(client.getStatus());
                    Thread.sleep(10000);
            }

//        new Thread(() -> {
//            while (true) {
//                try {
//                    if (!client.getStatus()) {
//                        client.connect("ksweb.club", 9091, "nas", "123456", 5000, "192.168.5.214", 5000);
//                    }
//                    Thread.sleep(10000);
//                } catch (IOException e) {
//                    e.printStackTrace();
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
//            }
//        }).start();
    }
}
