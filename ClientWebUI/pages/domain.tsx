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
  Alert,
  Snackbar
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import { ApiClient } from '../utils/api'
import { UserInfo, DomainConfig, DomainListResponse, OperationResponse } from '../components/types'

export default function Domain() {
  const [domains, setDomains] = useState<DomainConfig[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    domain: '',
    customDomain: ''
  })
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  })
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo)
      setUserInfo(user)
      loadDomains(user.id)
    }
  }, [])

  const loadDomains = async (userId: string) => {
    try {
      const result: DomainListResponse = await ApiClient.getDomains(userId)
      if (result.code === 200) {
        setDomains(result.data || [])
      }
    } catch (error) {
      showSnackbar('加载域名列表失败', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAddDomain = async () => {
    if (!userInfo || !formData.domain) {
      showSnackbar('请填写完整的域名信息', 'error')
      return
    }

    try {
      const result: OperationResponse = await ApiClient.addDomain({
        userId: userInfo.id,
        domain: formData.domain,
        customDomain: formData.customDomain
      })

      if (result.code === 200) {
        showSnackbar(result.msg, 'success')
        setDialogOpen(false)
        setFormData({ domain: '', customDomain: '' })
        loadDomains(userInfo.id)
        // 刷新用户信息
        refreshUserInfo()
      } else {
        showSnackbar(result.msg, 'error')
      }
    } catch (error) {
      showSnackbar('添加域名失败', 'error')
    }
  }

  const handleDeleteDomain = async (domain: string) => {
    if (!userInfo) return

    try {
      const result: OperationResponse = await ApiClient.removeDomain(userInfo.id, domain)
      showSnackbar(result.msg, 'success')
      loadDomains(userInfo.id)
      // 刷新用户信息
      refreshUserInfo()
    } catch (error) {
      showSnackbar('删除域名失败', 'error')
    }
  }

  const refreshUserInfo = async () => {
    if (!userInfo) return

    try {
      const result = await ApiClient.login(userInfo.username, userInfo.password)
      if (result.code === 200) {
        localStorage.setItem('userInfo', JSON.stringify(result.data))
        setUserInfo(result.data)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  添加域名
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>二级域名</TableCell>
                      <TableCell>自定义域名</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {domains.map((domainConfig, index) => (
                      <TableRow key={index}>
                        <TableCell>{domainConfig.domain}</TableCell>
                        <TableCell>{domainConfig.customDomain || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteDomain(domainConfig.domain)}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {domains.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            暂无域名配置
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>添加域名</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="二级域名"
                placeholder="二级域名(只是一个名字)"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="自定义域名"
                placeholder="自定义域名(如:www.heixiaoma.com),非必填"
                value={formData.customDomain}
                onChange={(e) => setFormData({...formData, customDomain: e.target.value})}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddDomain} variant="contained">确定</Button>
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