package miao.byusi.hp.proxy.protocol;

import cn.hserver.core.interfaces.ProtocolDispatcherAdapter;
import cn.hserver.core.ioc.annotation.Bean;
import cn.hserver.core.ioc.annotation.Order;
import cn.hserver.core.server.util.PropUtil;
import cn.hserver.plugin.web.context.WebConstConfig;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.timeout.IdleStateHandler;
import miao.byusi.hp.common.codec.HpMessageDecoder;
import miao.byusi.hp.common.codec.HpMessageEncoder;
import miao.byusi.hp.proxy.config.CostConfig;
import miao.byusi.hp.proxy.domian.bean.ConInfo;
import miao.byusi.hp.proxy.handler.HpServerHandler;

import java.net.InetSocketAddress;
import java.net.SocketAddress;

@Order(6)
@Bean
public class HpProtocolDispatcher implements ProtocolDispatcherAdapter {

    private Integer port;

    //判断HP头cd
    @Override
    public boolean dispatcher(ChannelHandlerContext ctx, ChannelPipeline channelPipeline, byte[] bytes) {
        InetSocketAddress socketAddress = (InetSocketAddress) ctx.channel().localAddress();
        if (port == null) {
            port = PropUtil.getInstance().getInt("port");
        }
        if (socketAddress.getPort() == port) {
            //检查是否被封控
            try {
                InetSocketAddress address = (InetSocketAddress) ctx.channel().remoteAddress();
                ConInfo conInfo = CostConfig.IP_USER.get(address.getHostString());
                if (conInfo != null) {
                    if (conInfo.getCount().get() > CostConfig.LONGIN_ERROR) {
                        ctx.close();
                        return false;
                    }
                }
            }catch (Exception e){}
            channelPipeline.addLast(new IdleStateHandler(60, 30, 0));
            channelPipeline.addLast(new HpMessageDecoder());
            channelPipeline.addLast(new HpMessageEncoder());
            channelPipeline.addLast(WebConstConfig.BUSINESS_EVENT, new HpServerHandler());
            return true;
        }
        return false;
    }
}
