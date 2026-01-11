import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material'
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Stop as StopIcon
} from '@mui/icons-material'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import { ApiClient } from '../utils/api'
import { 
  UserInfo, 
  Service, 
  ServerInfo
} from '../components/types'

export default function Center() {
  const [services, setServices] = useState<Service[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    ip: '',
    port: '',
    type: 'TCP',
    domain: '',
    remote_port: '0',
    server_info: ''
  })
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [ports, setPorts] = useState<string[]>([])
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning' 
  })
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo)
      setUserInfo(user)
      loadData(user)
      setupWebSocket()
    }

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  const loadData = async (user: UserInfo) => {
    try {
      const servicesData = await ApiClient.getServices()
      setServices(servicesData || [])

      const serversData = await ApiClient.getServers()
      if (serversData.code === 200) {
        setServers(serversData.data || [])
      }

      setDomains(Object.keys(user.domains || {}))
      // 确保端口是字符串数组
      setPorts((user.ports || []).map((port: string | number) => port.toString()))
    } catch (error) {
      showSnackbar('加载数据失败', 'error')
    }
  }

  const setupWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`)
      
      websocket.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data)
          setLogs(prev => [log, ...prev.slice(0, 49)])
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
      }

      websocket.onclose = () => {
        console.log('WebSocket连接关闭')
      }

      setWs(websocket)
    } catch (error) {
      console.error('建立WebSocket连接失败:', error)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAddService = async () => {
    if (!userInfo) return

    try {
      const result = await ApiClient.addService({
        ...formData,
        username: userInfo.username,
        password: userInfo.password
      })

      if (result.Code === 200) {
        showSnackbar(result.Msg, 'success')
        setDialogOpen(false)
        setFormData({
          ip: '',
          port: '',
          type: 'TCP',
          domain: '',
          remote_port: '0',
          server_info: ''
        })
        loadData(userInfo)
      } else {
        showSnackbar(result.Msg, 'error')
      }
    } catch (error) {
      showSnackbar('添加服务失败', 'error')
    }
  }

  const handleStopService = async (domain: string) => {
    try {
      const result = await ApiClient.stopService(domain)
      showSnackbar(result.Msg, 'success')
      if (userInfo) {
        loadData(userInfo)
      }
    } catch (error) {
      showSnackbar('停止服务失败', 'error')
    }
  }

  const checkCoreVersion = async () => {
    try {
      const result = await ApiClient.checkCoreVersion()
      showSnackbar(result.Msg, 'info')
    } catch (error) {
      showSnackbar('检查内核版本失败', 'error')
    }
  }

  const refreshUser = async () => {
    if (!userInfo) return

    try {
      const result = await ApiClient.login(userInfo.username, userInfo.password)

      if (result.code === 200) {
        localStorage.setItem('userInfo', JSON.stringify(result.data))
        setUserInfo(result.data)
        showSnackbar('配置信息已刷新', 'success')
        // 重新加载数据
        loadData(result.data)
      } else {
        showSnackbar(result.msg, 'error')
      }
    } catch (error) {
      showSnackbar('刷新失败', 'error')
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              添加穿透
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={checkCoreVersion}
            >
              检查内核版本
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshUser}
            >
              刷新配置信息
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                穿透服务列表
              </Typography>
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
                    {services.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.Domain}</TableCell>
                        <TableCell>{service.ProxyServer}</TableCell>
                        <TableCell>{service.Server}</TableCell>
                        <TableCell>
                          <Chip 
                            label={service.Status} 
                            color={service.Status === '运行中' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<StopIcon />}
                            onClick={() => handleStopService(service.Domain)}
                          >
                            停止
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {services.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            暂无穿透服务
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                穿透日志
              </Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {logs.map((log, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={log.Domain}
                        secondary={log.Msg}
                      />
                    </ListItem>
                    {index < logs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {logs.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="暂无日志"
                      secondary="等待WebSocket连接建立..."
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>添加穿透服务</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="内网IP"
                value={formData.ip}
                onChange={(e) => setFormData({...formData, ip: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="内网端口"
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: e.target.value})}
                fullWidth
                required
              />
              
              <FormControl component="fieldset">
                <FormLabel component="legend">穿透类型</FormLabel>
                <RadioGroup
                  row
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, server_info: e.target.value})}
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

              {formData.type !== 'UDP' && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">穿透域名</FormLabel>
                  <RadioGroup
                    row
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  >
                    {domains.map((domain) => (
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
                  row
                  value={formData.remote_port}
                  onChange={(e) => setFormData({...formData, remote_port: e.target.value})}
                >
                  <FormControlLabel value="0" control={<Radio />} label="随机端口" />
                  {ports.map((port) => (
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
            <Button onClick={handleAddService} variant="contained">确定</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Layout>
    </ProtectedRoute>
  )
}