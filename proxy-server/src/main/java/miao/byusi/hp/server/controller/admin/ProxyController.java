package miao.byusi.hp.server.controller.admin;

import cn.hserver.core.server.util.JsonResult;
import cn.hserver.plugin.web.annotation.Controller;
import cn.hserver.plugin.web.annotation.GET;
import cn.hserver.plugin.web.annotation.POST;
import cn.hserver.plugin.web.interfaces.HttpResponse;
import miao.byusi.hp.server.config.ConstConfig;
import miao.byusi.hp.server.domian.bean.GlobalStat;
import miao.byusi.hp.server.domian.entity.ProxyServerEntity;

import java.util.HashMap;

@Controller
public class ProxyController {

    @GET("/admin/proxy")
    public void tips(HttpResponse response) {
        HashMap<String, Object> tips = new HashMap<>();
        tips.put("list", ProxyServerEntity.getAll());
        tips.put("token", ConstConfig.REG_TOKEN);
        tips.put("reg_code", ConstConfig.REG_CODE);
        response.sendTemplate("/admin/proxy.ftl", tips);
    }


}
