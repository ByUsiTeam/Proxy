// src/pages/AutoProxy/AutoProxy.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import { configAPI, deviceAPI, serverAPI } from '../../services/api';
import { storage } from '../../utils/storage';
import type { AutoProxyItem, ServerInfo } from '../../types';

const AutoProxy: React.FC = () => {
  const [configList, setConfigList] = useState<AutoProxyItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('NO_ID');
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [formData, setFormData] = useState({
    userHost: '',
    type: 'TCP',
    serverHost: '',
    domain: '',
    port: '0',
  });
  const [customServer, setCustomServer] = useState('');
  const [showCustomServer, setShowCustomServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userInfo = storage.getUserInfo();

  useEffect(() => {
    if (userInfo) {
      loadConfigList();
      loadDeviceId();
      loadServers();
    }
  }, []);

  const loadConfigList = async () => {
    try {
      const response = await configAPI.list(userInfo.id);
      if (response.code === 200) {
        setConfigList(response.data);
      }
    } catch (error) {
      console.error('Failed to load config list:', error);
    }
  };

  const loadDeviceId = async () => {
    try {
      const response = await deviceAPI.getInfo();
      setDeviceId(response);
    } catch (error) {
      console.error('Failed to load device id:', error);
    }
  };

  const loadServers = async () => {
    try {
      const response = await serverAPI.loadData();
      if (response.code === 200) {
        setServers(response.data);
      }
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  const handleAddConfig = async () => {
    if (!formData.userHost.trim()) {
      setError('内网服务不能为空');
      return;
    }

    if (!formData.userHost.includes(':')) {
      setError('内网服务格式必须是 ip:端口');
      return;
    }

    if (deviceId === 'NO_ID') {
      setError('无法获取设备ID，请确保设备ID已设置');
      return;
    }

    if (!userInfo) return;

    setLoading(true);
    setError('');

    const data = {
      ...formData,
      serverHost: formData.serverHost === '-1' ? customServer : formData.serverHost,
      userId: userInfo.id,
      username: userInfo.username,
      password: userInfo.password,
      deviceId: deviceId,
    };

    try {
      const response = await configAPI.save(data);
      if (response.code === 200) {
        alert(response.msg);
        setDialogOpen(false);
        setFormData({
          userHost: '',
          type: 'TCP',
          serverHost: '',
          domain: '',
          port: '0',
        });
        setCustomServer('');
        loadConfigList();
        reloadUserInfo();
      } else {
        setError(response.msg);
      }
    } catch (error: any) {
      setError(error.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (window.confirm('确定要删除此配置吗？')) {
      try {
        const response = await configAPI.remove(id);
        alert(response.msg);
        loadConfigList();
      } catch (error) {
        alert('删除失败');
      }
    }
  };

  const reloadUserInfo = async () => {
    if (!userInfo) return;

    try {
      const response = await serverAPI.login(userInfo.username, userInfo.password);
      if (response.code === 200) {
        storage.setUserInfo(response.data);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to reload user info:', error);
    }
  };

  const formatDeviceId = (id: string) => {
    if (id.length > 12) {
      return `${id.slice(0, 6)}...${id.slice(-6)}`;
    }
    return id;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          添加穿透配置
        </Button>
        <Chip
          icon={<DeviceUnknownIcon />}
          label={`设备ID: ${formatDeviceId(deviceId)}`}
          color={deviceId === 'NO_ID' ? 'error' : 'primary'}
          variant="outlined"
        />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>设备ID</TableCell>
                  <TableCell>内网服务</TableCell>
                  <TableCell>外网服务</TableCell>
                  <TableCell>穿透类型</TableCell>
                  <TableCell>穿透域名</TableCell>
                  <TableCell>穿透端口</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDeviceId(item.deviceId)}</TableCell>
                    <TableCell>{item.userHost}</TableCell>
                    <TableCell>{item.serverHost}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.domain || '-'}</TableCell>
                    <TableCell>{item.port}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteConfig(item.id)}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 说明 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            功能说明
          </Typography>
          <Typography variant="body2" paragraph>
            如果你在这里添加了云端存储，那么Proxy启动时就会加载云端配置，然后进行内网穿透，减少了每次打开都需要重新填写配置这种反人类的，头大的事情。该功能要求设备ID。
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            如何设置：
          </Typography>
          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
            <ul style={{ marginTop: 0, paddingLeft: 20 }}>
              <li>设备ID要求：自定义10-36个字符串长度可以是字母或者数字（不要和别人冲突了，不要泄露了）</li>
              <li>二进制文件：proxy-client -deviceId=设备ID</li>
            </ul>
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            当前设备ID: {deviceId === 'NO_ID' ? '未设置设备ID(意味着你用不了这个功能)' : deviceId}
          </Typography>
        </CardContent>
      </Card>

      {/* 添加配置对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加穿透配置</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {deviceId === 'NO_ID' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              无法获取设备ID，请先设置设备ID
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="内网服务"
              helperText="内网服务（ip:端口）"
              value={formData.userHost}
              onChange={(e) => setFormData({ ...formData, userHost: e.target.value })}
              fullWidth
              required
            />
            
            <FormControl component="fieldset">
              <FormLabel component="legend">穿透类型</FormLabel>
              <RadioGroup
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                row
              >
                <FormControlLabel value="TCP" control={<Radio />} label="TCP" />
                <FormControlLabel value="UDP" control={<Radio />} label="UDP" />
                <FormControlLabel value="TCP_UDP" control={<Radio />} label="TCP+UDP" />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">穿透服务选择</FormLabel>
              <RadioGroup
                value={formData.serverHost}
                onChange={(e) => {
                  setFormData({ ...formData, serverHost: e.target.value });
                  setShowCustomServer(e.target.value === '-1');
                }}
              >
                {servers.map((server) => (
                  <FormControlLabel
                    key={`${server.ip}:${server.port}`}
                    value={`${server.ip}:${server.port}`}
                    control={<Radio />}
                    label={`${server.name} 在线数：${server.num}`}
                  />
                ))}
                <FormControlLabel
                  value="-1"
                  control={<Radio />}
                  label="自定义服务"
                />
              </RadioGroup>
            </FormControl>

            {showCustomServer && (
              <TextField
                label="自定义穿透服务 (ip:端口)"
                value={customServer}
                onChange={(e) => setCustomServer(e.target.value)}
                fullWidth
              />
            )}

            {formData.type !== 'UDP' && userInfo?.domains && (
              <FormControl component="fieldset">
                <FormLabel component="legend">穿透域名</FormLabel>
                <RadioGroup
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  row
                >
                  {Object.keys(userInfo.domains).map((domain) => (
                    <FormControlLabel
                      key={domain}
                      value={domain}
                      control={<Radio />}
                      label={domain}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            <FormControl component="fieldset">
              <FormLabel component="legend">外网端口号</FormLabel>
              <RadioGroup
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                row
              >
                <FormControlLabel value="0" control={<Radio />} label="随机端口" />
                {userInfo?.ports?.map((port: string) => (
                  <FormControlLabel
                    key={port}
                    value={port}
                    control={<Radio />}
                    label={port}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAddConfig}
            variant="contained"
            disabled={loading || deviceId === 'NO_ID'}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutoProxy;