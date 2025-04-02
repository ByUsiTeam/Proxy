package miao.byusi.hp.server.service;

import miao.byusi.hp.server.domian.entity.AppEntity;
import miao.byusi.hp.server.domian.entity.PortEntity;
import miao.byusi.hp.server.domian.entity.UserEntity;
import miao.byusi.hp.server.domian.vo.UserVo;
import org.beetl.sql.core.page.PageResult;

import java.util.List;

/**
 * @author hxm
 */
public interface AppService {

    /**
     * 列表
     *
     * @param page
     * @param pageSize
     * @return
     */
    PageResult<AppEntity> list(Integer page, Integer pageSize);

    /**
     * 添加用户
     *
     * @param appEntity
     */
    boolean add(AppEntity appEntity);

    /**
     * 删除
     *
     * @param id
     */
    void remove(String id);

    /**
     * 最新版本
     */
    AppEntity getAppVersion();

}
