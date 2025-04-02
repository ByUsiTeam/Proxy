package miao.byusi.hp.server.service;

import miao.byusi.hp.server.domian.entity.AppEntity;
import miao.byusi.hp.server.domian.entity.PayEntity;
import org.beetl.sql.core.page.PageResult;

import java.util.List;

/**
 * @author hxm
 */
public interface PayService {

    /**
     * 列表
     *
     * @param page
     * @param pageSize
     * @return
     */
    PageResult<PayEntity> list(Integer page, Integer pageSize);

    /**
     * 添加用户
     *
     * @param appEntity
     */
    boolean add(PayEntity appEntity);

    double countPrice();

    /**
     * 删除
     *
     * @param id
     */
    void remove(String id);

    /**
     * 最新版本
     */
    List<PayEntity> getTop52();

}
