package miao.byusi.hp.common.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

/**
 * @author hxm
 */
public class SerializationUtil {
    private static final Logger log = LoggerFactory.getLogger(SerializationUtil.class);

    public static byte[] serialize(Object o){
        byte[] byteArray = null ;
        try(ByteArrayOutputStream bty = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bty)){
            oos.writeObject(o);
            byteArray = bty.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return byteArray ;
    }

    public static Object unserialize(byte[] bytes){
        Object o = null ;
        try(ByteArrayInputStream bai = new ByteArrayInputStream(bytes);
            ObjectInputStream ois = new ObjectInputStream(bai)){
            o = ois.readObject();
        } catch (Exception e) {
            log.error("反序列化失败", e);
        }
        return o;
    }

}
