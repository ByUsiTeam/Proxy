package miao.byusi.hp.server.dao;

import cn.hserver.plugin.beetlsql.annotation.BeetlSQL;
import miao.byusi.hp.server.domian.entity.ConfigEntity;
import miao.byusi.hp.server.domian.entity.UserEntity;
import org.beetl.sql.mapper.BaseMapper;
import org.beetl.sql.mapper.annotation.Sql;
import org.beetl.sql.mapper.annotation.Update;
import org.checkerframework.checker.units.qual.C;

/**
 * @author hxm
 */
@BeetlSQL
public interface ConfigDao extends BaseMapper<ConfigEntity> {

}
