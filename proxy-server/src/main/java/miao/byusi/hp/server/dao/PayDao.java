package miao.byusi.hp.server.dao;

import cn.hserver.plugin.beetlsql.annotation.BeetlSQL;
import miao.byusi.hp.server.domian.entity.AppEntity;
import miao.byusi.hp.server.domian.entity.PayEntity;
import org.beetl.sql.mapper.BaseMapper;

/**
 * @author hxm
 */
@BeetlSQL
public interface PayDao extends BaseMapper<PayEntity> {

}
