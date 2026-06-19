package miao.byusi.hp.server.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;

/**
 * @author hxm
 */
public class FileUtil {
    private static final Logger log = LoggerFactory.getLogger(FileUtil.class);

    public static void copyFile(InputStream is, String outPath) {
        try {
            FileOutputStream fos = new FileOutputStream(outPath);
            byte[] b = new byte[1024];
            while ((is.read(b)) != -1) {
                fos.write(b);
            }
            is.close();
            fos.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    public static String readFile(InputStream is) throws IOException {
        try {
            InputStreamReader inputStreamReader = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(inputStreamReader);
            String st = "";
            String s = "";
            while ((st = br.readLine()) != null)
                s += st + "\r\n";

            br.close();
            inputStreamReader.close();
            is.close();
            return s;
        } catch (Exception e) {
            log.error("文件读取失败", e);
        }finally {
            is.close();
        }
        return null;
    }

}
