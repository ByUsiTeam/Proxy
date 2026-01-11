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
  Divider
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import { ApiClient } from '../utils/api'
import { 
  UserInfo, 
  ProxyConfig, 
  ServerInfo
} from '../components/types'

export default function AutoProxy() {
  const [configs, setConfigs] = useState<ProxyConfig[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deviceId, setDeviceId] = useState('NO_ID')
  const [formData, setFormData] = useState({
    userHost: '',
    type: 'TCP',
    serverHost: '',
    domain: '',
    port: '0'
  })
  const [customServer, setCustomServer] = useState('')
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [ports, setPorts] = useState<string[]>([])
  const [showCustomServer, setShowCustomServer] = useState(false)
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' | 'warning' 
  })
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo)
      setUserInfo(user)
      loadDeviceId()
      loadConfigs(user)
      loadServers()
      setDomains(Object.keys(user.domains || {}))
      // 确保端口是字符串数组
      setPorts((user.ports || []).map((port: string | number) => port.toString()))
    }
  }, [])

  const loadDeviceId = async () => {
    try {
      const deviceId = await ApiClient.getDeviceInfo()
      if (deviceId !== 'NO_ID') {
        setDeviceId(deviceId as string)
      }
    } catch (error) {
      console.error('获取设备ID失败:', error)
    }
  }

  const loadConfigs = async (user: UserInfo) => {
    try {
      const result = await ApiClient.getProxyConfigs(user.id)
      if (result.code === 200) {
        setConfigs(result.data || [])
      } else {
        showSnackbar(result.msg || '加载配置失败', 'error')
      }
    } catch (error) {
      showSnackbar('加载配置失败', 'error')
    }
  }

  const loadServers = async () => {
    try {
      const result = await ApiClient.getServers()
      if (result.code === 200) {
        setServers(result.data || [])
      }
    } catch (error) {
      console.error('加载服务器列表失败:', error)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAddConfig = async () => {
    if (deviceId === 'NO_ID') {
      showSnackbar('不能获取到设备唯一ID，因此不能使用该功能', 'error')
      return
    }

    if (!userInfo) return

    const submitData = {
      ...formData,
      userId: userInfo.id,
      username: userInfo.username,
      password: userInfo.password,
      deviceId: deviceId
    }

    // 处理自定义服务器
    if (submitData.serverHost === '-1') {
      if (!customServer) {
        showSnackbar('请输入自定义服务器地址', 'error')
        return
      }
      submitData.serverHost = customServer
    }

    // 验证内网服务格式
    if (!submitData.userHost.includes(':')) {
      showSnackbar('内网服务格式必须为 ip:端口', 'error')
      return
    }

    try {
      const result = await ApiClient.saveProxyConfig(submitData)
      if (result.code === 200) {
        showSnackbar(result.msg, 'success')
        setDialogOpen(false)
        setFormData({
          userHost: '',
          type: 'TCP',
          serverHost: '',
          domain: '',
          port: '0'
        })
        setCustomServer('')
        setShowCustomServer(false)
        loadConfigs(userInfo)
      } else {
        showSnackbar(result.msg, 'error')
      }
    } catch (error) {
      showSnackbar('添加配置失败', 'error')
    }
  }

  const handleDeleteConfig = async (id: string) => {
    try {
      const result = await ApiClient.removeProxyConfig(id)
      showSnackbar(result.msg, 'success')
      if (userInfo) {
        loadConfigs(userInfo)
      }
    } catch (error) {
      showSnackbar('删除配置失败', 'error')
    }
  }

  const formatDeviceId = (id: string) => {
    if (id.length > 12) {
      return `${id.slice(0, 6)}...${id.slice(-6)}`
    }
    return id
  }

  const handleServerHostChange = (value: string) => {
    setFormData({...formData, serverHost: value})
    setShowCustomServer(value === '-1')
  }

  const handleTypeChange = (value: string) => {
    setFormData({...formData, type: value})
    // 如果是UDP类型，清空域名选择
    if (value === 'UDP') {
      setFormData(prev => ({...prev, domain: ''}))
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  添加穿透配置
                </Button>
                <Typography variant="body1">
                  设备ID: <strong>{formatDeviceId(deviceId)}</strong>
                </Typography>
              </Box>

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
                    {configs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>{formatDeviceId(config.deviceId)}</TableCell>
                        <TableCell>{config.userHost}</TableCell>
                        <TableCell>{config.serverHost}</TableCell>
                        <TableCell>{config.type}</TableCell>
                        <TableCell>{config.domain}</TableCell>
                        <TableCell>{config.port}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteConfig(config.id)}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {configs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            暂无穿透配置
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                功能说明
              </Typography>
              <Typography variant="body2" paragraph>
                当前设备ID: <strong>{deviceId}</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                如果你在这里添加了云端存储，那么Proxy启动时就会加载云端配置，然后进行内网穿透，
                减少了每次打开都需要重新填写配置这种反人类的，头大的事情。该功能要求设备ID。
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                如何设置
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="设备ID要求"
                    secondary="自定义10-36个字符串长度可以是字母或者数字（不要和别人冲突了，不要泄露了）"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="二进制文件"
                    secondary="proxy-client -deviceId=设备ID"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>添加穿透配置</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="内网服务"
                placeholder="内网服务（ip:端口）"
                value={formData.userHost}
                onChange={(e) => setFormData({...formData, userHost: e.target.value})}
                fullWidth
                required
              />
              
              <FormControl component="fieldset">
                <FormLabel component="legend">穿透类型</FormLabel>
                <RadioGroup
                  row
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
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
                  onChange={(e) => handleServerHostChange(e.target.value)}
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
                  label="自定义穿透服务"
                  placeholder="ip:端口"
                  value={customServer}
                  onChange={(e) => setCustomServer(e.target.value)}
                  fullWidth
                  required
                />
              )}

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
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: e.target.value})}
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
            <Button onClick={handleAddConfig} variant="contained">确定</Button>
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