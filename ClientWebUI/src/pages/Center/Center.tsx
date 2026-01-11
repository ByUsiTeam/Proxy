// src/pages/Center/Center.tsx
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { serverAPI } from '../../services/api';
import { storage } from '../../utils/storage';
import type { ProxyItem, ServerInfo } from '../../types';

const Center: React.FC = () => {
  const [proxyList, setProxyList] = useState<ProxyItem[]>([]);
  const [logList, setLogList] = useState<any[]>([]);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    ip: '',
    port: '',
    type: 'TCP',
    server_info: '',
    domain: '',
    remote_port: '0',
  });
  const [customServer, setCustomServer] = useState('');
  const [showCustomServer, setShowCustomServer] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const userInfo = storage.getUserInfo();

  useEffect(() => {
    if (userInfo) {
      loadData();
      setupWebSocket();
      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, []);

  const loadData = async () => {
    try {
      const [proxyResponse, serverResponse] = await Promise.all([
        serverAPI.proxyList(),
        serverAPI.loadData(),
      ]);

      setProxyList(proxyResponse || []);
      
      if (serverResponse.code === 200) {
        setServers(serverResponse.data);
      }

      // 检查是否需要显示支付弹窗
      const showPay = storage.getShowPay();
      if (showPay === '0') {
        // 这里可以添加支付弹窗逻辑
        storage.setShowPay('1');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogList(prev => [data, ...prev.slice(0, 49)]);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    setWs(socket);
  };

  const handleStartProxy = async () => {
    if (!userInfo) return;

    const data = {
      ...formData,
      password: userInfo.password,
      username: userInfo.username,
      server_info: formData.server_info === '-1' ? customServer : formData.server_info,
    };

    try {
      const response = await serverAPI.startProxy(data);
      if (response.Code === 200) {
        alert(response.Msg);
        setDialogOpen(false);
        loadData();
      } else {
        alert(response.Msg);
      }
    } catch (error: any) {
      alert('启动失败');
    }
  };

  const handleStopProxy = async (domain: string) => {
    try {
      const response = await serverAPI.stopProxy(domain);
      alert(response.Msg);
      loadData();
    } catch (error: any) {
      alert('停止失败');
    }
  };

  const handleCheckCore = async () => {
    try {
      const response = await serverAPI.checkCore();
      alert(response.Msg);
    } catch (error: any) {
      alert('检查失败');
    }
  };

  const handleRefreshUser = async () => {
    if (!userInfo) return;

    try {
      const response = await serverAPI.login(userInfo.username, userInfo.password);
      if (response.code === 200) {
        storage.setUserInfo(response.data);
        window.location.reload();
      } else {
        alert('刷新失败');
      }
    } catch (error: any) {
      alert('刷新失败');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          添加
        </Button>
        <Button
          variant="outlined"
          startIcon={<CheckCircleIcon />}
          onClick={handleCheckCore}
        >
          检查内核版本
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshUser}
        >
          刷新配置信息
        </Button>
      </Box>

      {/* 代理列表 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名字</TableCell>
                  <TableCell>内网服务</TableCell>
                  <TableCell>穿透服务</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proxyList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.Domain}</TableCell>
                    <TableCell>{item.ProxyServer}</TableCell>
                    <TableCell>{item.Server}</TableCell>
                    <TableCell>{item.Status}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleStopProxy(item.Domain)}
                      >
                        停止
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 日志 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            穿透日志
          </Typography>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {logList.map((log, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={log.Domain}
                  secondary={log.Msg}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* 添加代理对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加穿透配置</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="内网IP"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              fullWidth
            />
            <TextField
              label="内网端口"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              fullWidth
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
                value={formData.server_info}
                onChange={(e) => {
                  setFormData({ ...formData, server_info: e.target.value });
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

            {formData.type !== 'UDP' && (
              <FormControl component="fieldset">
                <FormLabel component="legend">穿透域名</FormLabel>
                <RadioGroup
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  row
                >
                  {userInfo?.domains && Object.keys(userInfo.domains).map((domain) => (
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
                value={formData.remote_port}
                onChange={(e) => setFormData({ ...formData, remote_port: e.target.value })}
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
          <Button onClick={handleStartProxy} variant="contained">
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Center;