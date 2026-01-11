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
import { UserInfo, PortConfig, PortListResponse, OperationResponse } from '../components/types'

export default function Port() {
  const [ports, setPorts] = useState<PortConfig[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newPort, setNewPort] = useState('')
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
      loadPorts(user.id)
    }
  }, [])

  const loadPorts = async (userId: string) => {
    try {
      const result: PortListResponse = await ApiClient.getPorts(userId)
      if (result.code === 200) {
        setPorts(result.data || [])
      }
    } catch (error) {
      showSnackbar('加载端口列表失败', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleAddPort = async () => {
    if (!userInfo || !newPort) {
      showSnackbar('请输入端口号', 'error')
      return
    }

    try {
      const result: OperationResponse = await ApiClient.addPort({
        userId: userInfo.id,
        port: newPort
      })

      if (result.code === 200) {
        showSnackbar(result.msg, 'success')
        setDialogOpen(false)
        setNewPort('')
        loadPorts(userInfo.id)
        // 刷新用户信息
        refreshUserInfo()
      } else {
        showSnackbar(result.msg, 'error')
      }
    } catch (error) {
      showSnackbar('添加端口失败', 'error')
    }
  }

  const handleDeletePort = async (port: string) => {
    if (!userInfo) return

    try {
      const result: OperationResponse = await ApiClient.removePort(userInfo.id, port)
      showSnackbar(result.msg, 'success')
      loadPorts(userInfo.id)
      // 刷新用户信息
      refreshUserInfo()
    } catch (error) {
      showSnackbar('删除端口失败', 'error')
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
                  添加端口
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>端口</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ports.map((portConfig, index) => (
                      <TableRow key={index}>
                        <TableCell>{portConfig.port}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeletePort(portConfig.port)}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {ports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" color="text.secondary">
                            暂无端口配置
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
          <DialogTitle>添加端口</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="外网端口"
              type="text"
              fullWidth
              variant="outlined"
              value={newPort}
              onChange={(e) => setNewPort(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="请输入端口号"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddPort} variant="contained">确定</Button>
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