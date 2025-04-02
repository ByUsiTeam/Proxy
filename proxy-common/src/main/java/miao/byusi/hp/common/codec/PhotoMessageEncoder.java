package miao.byusi.hp.common.codec;

import cn.hserver.core.server.util.PropUtil;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.ByteBufUtil;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.bytes.ByteArrayDecoder;
import io.netty.handler.codec.bytes.ByteArrayEncoder;
import miao.byusi.hp.common.handler.PhotoGifMessageHandler;
import miao.byusi.hp.common.handler.PhotoJpgMessageHandler;
import miao.byusi.hp.common.handler.PhotoMessageHandler;
import miao.byusi.hp.common.handler.PhotoPngMessageHandler;

import java.util.ArrayList;
import java.util.List;

public class PhotoMessageEncoder extends ByteArrayEncoder {
    private final List<PhotoMessageHandler> photoMessageHandler = new ArrayList<>();

    private final static boolean isCheck= PropUtil.getInstance().getBoolean("photoCheck");
    private final boolean hasCloseCheckPhoto;

    public PhotoMessageEncoder(String hasCloseCheckPhoto,String username,String host) {
        this.hasCloseCheckPhoto=Boolean.parseBoolean(hasCloseCheckPhoto);
        photoMessageHandler.add(new PhotoJpgMessageHandler(username,host));
        photoMessageHandler.add(new PhotoPngMessageHandler(username,host));
        photoMessageHandler.add(new PhotoGifMessageHandler(username,host));
    }

    @Override
    protected void encode(ChannelHandlerContext ctx, byte[] msg, List<Object> out) throws Exception {
        //校验缓存图片
        if (isCheck&&!hasCloseCheckPhoto) {
            for (PhotoMessageHandler messageHandler : photoMessageHandler) {
                if (messageHandler.checkAndSavePhoto(msg)) {
                    break;
                }
            }
        }
        out.add(Unpooled.wrappedBuffer(msg));
    }
}
