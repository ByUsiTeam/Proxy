import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Send as SendIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  Dns as DnsIcon
} from '@mui/icons-material'
import { ApiClient } from '../utils/api'
import { UserInfo } from '../components/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Login() {
  const [tabValue, setTabValue] = useState(0)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    password: '', 
    code: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [donations, setDonations] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      router.push('/center')
    }
    loadDonations()
  }, [router])

  const loadDonations = async () => {
    try {
      const result = await ApiClient.getDonations()
      if (result.code === 200) {
        setDonations(result.data || [])
      }
    } catch (error) {
      console.error('加载捐赠数据失败:', error)
    }
  }

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      setError('请填写完整的登录信息')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result: any = await ApiClient.login(loginData.username, loginData.password)

      if (result.code === 200) {
        localStorage.setItem('userInfo', JSON.stringify(result.data))
        if (result.data.level === 0) {
          localStorage.setItem('showPay', '0')
        }
        router.push('/center')
      } else {
        setError(result.msg)
      }
    } catch (err: any) {
      setError('登录失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (!registerData.username) {
      setError('请输入邮箱地址')
      return
    }

    try {
      const result: any = await ApiClient.sendEmailCode(registerData.username)

      if (result.code === 200) {
        setSuccess('验证码发送成功，请查收邮件（留意垃圾邮箱）')
      } else {
        setError(result.msg)
      }
    } catch (err: any) {
      setError('发送验证码失败')
    }
  }

  const handleRegister = async () => {
    if (!registerData.username || !registerData.password || !registerData.code) {
      setError('请填写完整的注册信息')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result: any = await ApiClient.register(
        registerData.username,
        registerData.password,
        registerData.code
      )

      if (result.code === 200) {
        setSuccess(result.msg)
        setTabValue(0)
        setRegisterData({ username: '', password: '', code: '' })
      } else {
        setError(result.msg)
      }
    } catch (err: any) {
      setError('注册失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <DnsIcon />,
      title: '多端支持',
      description: 'Android端、Win、Linux、Mac、NAS、Docker等环境 X86、ARM、等CPU架构。'
    },
    {
      icon: <PublicIcon />,
      title: '二级域名赠送',
      description: '注册的账号就是二级域名的名字，方便用户快速开发调试。'
    },
    {
      icon: <SecurityIcon />,
      title: '固定端口',
      description: '我们支持动态端口与固定端口模式，穿透FTP MYSQL Redis MQ等服务需要。'
    },
    {
      icon: <SendIcon />,
      title: '自定义域名',
      description: '我们支持用户自定义域名,只需要域名名字或者二级名字和账号名字一样就可以解析。'
    },
    {
      icon: <SpeedIcon />,
      title: 'HTTPS支持',
      description: '支持用户自定义域名的同时在云厂商申请ssl证书如Nginx上配置https进行安全加密或者系统分配的域名也可以申请证书进行配置。'
    }
  ]

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Proxy内网穿透
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setTabValue(0)}
            sx={{ mr: 1 }}
          >
            登录
          </Button>
          <Button 
            color="inherit" 
            onClick={() => setTabValue(1)}
          >
            注册（更新密码）
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography component="h1" variant="h4" gutterBottom color="primary" align="center">
                用户登录/注册
              </Typography>
              
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ width: '100%', mb: 2 }}
              >
                <Tab label="登录" />
                <Tab label="注册/更新密码" />
              </Tabs>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <TabPanel value={tabValue} index={0}>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="邮箱"
                    variant="outlined"
                    margin="normal"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  />
                  <TextField
                    fullWidth
                    label="密码"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : '登录'}
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="邮箱"
                    variant="outlined"
                    margin="normal"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  />
                  <TextField
                    fullWidth
                    label="密码"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                      fullWidth
                      label="邮件验证码"
                      variant="outlined"
                      value={registerData.code}
                      onChange={(e) => setRegisterData({...registerData, code: e.target.value})}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleSendCode}
                      sx={{ minWidth: '120px' }}
                    >
                      发送验证码
                    </Button>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : '注册/更新密码'}
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="primary">
                    系统特色
                  </Typography>
                  <List>
                    {features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {feature.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.title}
                          secondary={feature.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary">
                  最新捐赠者
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  打赏请备注邮箱账号
                </Typography>
                <Grid container spacing={1}>
                  {donations.map((donation, index) => (
                    <Grid item xs={6} key={index}>
                      <Paper sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {donation.username}
                        </Typography>
                        <Typography variant="body2" color="secondary">
                          ￥{donation.price}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                使用声明
              </Typography>
              <Typography variant="body2" paragraph>
                本项目是一个公益项目，请各路大神不用恶意攻击，滥用资源，免费开源的项目真的不多
                使用服务器来进行内网穿透，下载对应的终端的软件包，下载安装免费使用，软件内没有任何的广告，放心使用，对软件有问题也可以加入交流群，进行咨询。
                软件系统，会自动清理一个月未登录登录的账号，如果出现账号不存在，或者登录失败问题，请进行重新注册使用。
                本软件可应用于远程办公、远程联调、接口联调、接口回调、公众号调试、本地开发微信、MySQL、TCP、UDP端口转发等一系列功能。
                软件永远免费，但禁止搭建，涉政治、色情、暴力、赌博、诈骗、影视、私、
                违反国家法律、给国家造成负面影响等等的网站，出现问题后果自负，本站概不负责。如有发现一律封号处理。
              </Typography>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  href="https://gitee.com/byusi/proxy" 
                  target="_blank"
                  sx={{ mr: 1 }}
                >
                  开源地址
                </Button>
                <Button 
                  variant="outlined" 
                  href="https://qm.qq.com/q/OTxfKEyDsI" 
                  target="_blank"
                >
                  QQ群：822726278
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}