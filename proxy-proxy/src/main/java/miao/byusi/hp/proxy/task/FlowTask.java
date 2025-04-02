package miao.byusi.hp.proxy.task;

import cn.hserver.core.ioc.annotation.Bean;
import cn.hserver.core.ioc.annotation.Task;
import miao.byusi.hp.proxy.domian.bean.GlobalStat;
import miao.byusi.hp.proxy.service.HttpService;

@Bean
public class FlowTask {

    @Task(name = "注册服务", time = "10000")
    public void reg() {
        HttpService.reg();
    }


    @Task(name = "stat", time = "5000")
    public void stat() {
        GlobalStat.clear();
    }
}
