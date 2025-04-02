package miao.byusi.hp.server.dao;

import cn.hserver.plugin.beetlsql.annotation.BeetlSQL;
import miao.byusi.hp.server.domian.entity.AppEntity;
import miao.byusi.hp.server.domian.entity.CoreEntity;
import org.beetl.sql.mapper.BaseMapper;

/**
 * @author hxm
 */
@BeetlSQL
public interface CoreDao extends BaseMapper<CoreEntity> {

}
