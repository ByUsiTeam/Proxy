package miao.byusi.hp.server.dao;

import cn.hserver.plugin.beetlsql.annotation.BeetlSQL;
import miao.byusi.hp.server.domian.entity.AppEntity;
import org.beetl.sql.mapper.BaseMapper;

/**
 * @author hxm
 */
@BeetlSQL
public interface AppDao extends BaseMapper<AppEntity> {

}
