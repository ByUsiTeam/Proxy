package miao.byusi.hp.server.dao;

import cn.hserver.plugin.beetlsql.annotation.BeetlSQL;
import miao.byusi.hp.server.domian.entity.DomainEntity;
import miao.byusi.hp.server.domian.entity.PortEntity;
import org.beetl.sql.mapper.BaseMapper;

/**
 * @author hxm
 */
@BeetlSQL
public interface DomainDao extends BaseMapper<DomainEntity> {

}
