package miao.byusi.hp.common.codec;

import cn.hserver.core.server.util.PropUtil;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageEncoder;
import miao.byusi.hp.common.handler.PhotoGifMessageHandler;
import miao.byusi.hp.common.handler.PhotoJpgMessageHandler;
import miao.byusi.hp.common.handler.PhotoMessageHandler;
import miao.byusi.hp.common.handler.PhotoPngMessageHandler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * 图片消息编码器
 * 功能：透明地检测和保存经过的图片，不干扰正常数据传输
 */
public class PhotoMessageEncoder extends MessageToMessageEncoder<byte[]> {
    private static final Logger log = LoggerFactory.getLogger(PhotoMessageEncoder.class);

    private final List<PhotoMessageHandler> photoMessageHandler = new ArrayList<>();

    private final static boolean IS_CHECK = PropUtil.getInstance().getBoolean("photoCheck");
    private final boolean hasCloseCheckPhoto;
    private final String username;
    private final String host;

    /**
     * 构造图片编码器
     *
     * @param hasCloseCheckPhoto 是否关闭图片检测
     * @param username          用户名
     * @param host              主机地址
     */
    public PhotoMessageEncoder(String hasCloseCheckPhoto, String username, String host) {
        this.hasCloseCheckPhoto = Boolean.parseBoolean(hasCloseCheckPhoto);
        this.username = username;
        this.host = host;

        // 初始化各类图片处理器
        photoMessageHandler.add(new PhotoJpgMessageHandler(username, host));
        photoMessageHandler.add(new PhotoPngMessageHandler(username, host));
        photoMessageHandler.add(new PhotoGifMessageHandler(username, host));
    }

    @Override
    protected void encode(ChannelHandlerContext ctx, byte[] msg, List<Object> out) throws Exception {
        // 校验并保存图片（如果开启了检测且客户端未关闭）
        if (IS_CHECK && !hasCloseCheckPhoto) {
            processPhotoMessage(msg);
        }

        // 始终转发原始数据，不中断业务
        out.add(Unpooled.wrappedBuffer(msg));
    }

    /**
     * 处理图片消息
     *
     * @param data 原始字节数据
     */
    private void processPhotoMessage(byte[] data) {
        // 快速判断：如果数据太小，不可能是有效图片
        if (data == null || data.length < 32) {
            return;
        }

        for (PhotoMessageHandler messageHandler : photoMessageHandler) {
            try {
                if (messageHandler.checkAndSavePhoto(data)) {
                    // 一旦匹配成功就停止后续处理
                    break;
                }
            } catch (Exception e) {
                // 单个处理器异常不影响其他处理器和业务传输
                log.error("图片处理器异常 [用户: {}, 主机: {}, 处理器: {}]", username, host, messageHandler.getClass().getSimpleName(), e);
            }
        }
    }

    /**
     * 获取当前编码器的配置信息
     */
    public String getConfigInfo() {
        return String.format(
                "PhotoMessageEncoder{全局检测=%s, 客户端关闭=%s, 用户=%s, 主机=%s}",
                IS_CHECK, hasCloseCheckPhoto, username, host
        );
    }

    @Override
    public boolean isSharable() {
        // 由于包含用户状态，不能共享
        return false;
    }
}