import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Public as PublicIcon,
  Dns as DnsIcon,
  Language as LanguageIcon,
  AutoAwesome as AutoAwesomeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import { UserInfo } from './types'

interface LayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { text: '穿透服务', icon: <PublicIcon />, path: '/center' },
  { text: '端口管理', icon: <DnsIcon />, path: '/port' },
  { text: '域名管理', icon: <LanguageIcon />, path: '/domain' },
  { text: '自动穿透', icon: <AutoAwesomeIcon />, path: '/autoproxy' },
  { text: '穿透日志', icon: <AssignmentIcon />, path: '/log' },
]

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo))
    } else {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    setUserMenuAnchor(null)
    router.push('/')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setDrawerOpen(false)
  }

  if (!userInfo) {
    return <Box>Loading...</Box>
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Proxy内网穿透
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {userInfo.username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                用户: {userInfo.username} | 级别: {userInfo.level}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setUserMenuAnchor(null)}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              设置
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              退出登录
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                selected={router.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  )
}