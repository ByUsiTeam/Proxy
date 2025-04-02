package miao.byusi.hp.server.service.impl;

import cn.hserver.core.ioc.annotation.Autowired;
import cn.hserver.core.ioc.annotation.Bean;
import miao.byusi.hp.server.config.ConstConfig;
import miao.byusi.hp.server.dao.ConfigDao;
import miao.byusi.hp.server.domian.entity.ConfigEntity;
import miao.byusi.hp.server.domian.entity.StatisticsEntity;
import miao.byusi.hp.server.service.ConfigService;
import miao.byusi.hp.server.utils.DateUtil;
import org.beetl.sql.core.page.PageResult;

import java.util.List;
import java.util.UUID;

@Bean
public class ConfigServiceImpl implements ConfigService {

    @Autowired
    private ConfigDao configDao;

    @Override
    public boolean save(ConfigEntity config) {
        //一个账号只能配置三个账号
        List<ConfigEntity> select = configDao.createLambdaQuery().andEq(ConfigEntity::getUserId, config.getUserId()).select();
        if (select!=null&&select.size()>= ConstConfig.PROXY_SIZE){
            return false;
        }
        config.setId(UUID.randomUUID().toString());
        config.setCreateTime(String.valueOf(System.currentTimeMillis()));
        configDao.insert(config);
        return true;
    }

    @Override
    public List<ConfigEntity> list(String userId) {
        return configDao.createLambdaQuery().andEq(ConfigEntity::getUserId,userId).select();
    }

    @Override
    public List<ConfigEntity> listDevice(String deviceId) {
        return configDao.createLambdaQuery().andEq(ConfigEntity::getDeviceId,deviceId).select();
    }
    @Override
    public PageResult<ConfigEntity> list(Integer page, Integer pageSize) {
        PageResult<ConfigEntity> create_time_desc = configDao.createLambdaQuery().orderBy("create_time desc").page(page, pageSize);
        for (ConfigEntity statisticsEntity : create_time_desc.getList()) {
            statisticsEntity.setCreateTime(DateUtil.stampToDate(statisticsEntity.getCreateTime()));
        }
        return create_time_desc;
    }

    @Override
    public boolean remove(String id) {
        return configDao.deleteById(id)>0;
    }
}
