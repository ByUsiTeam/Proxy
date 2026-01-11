import React, { useState, useEffect } from 'react'
import {
  Box,
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
  Alert,
  Snackbar,
  Pagination,
  CircularProgress
} from '@mui/material'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import { ApiClient } from '../utils/api'
import { UserInfo, LogEntry, LogsResponse } from '../components/types'

export default function Log() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
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
      loadLogs(user.username, currentPage)
    }
  }, [currentPage])

  const loadLogs = async (username: string, page: number) => {
    setLoading(true)
    try {
      const result: LogsResponse = await ApiClient.getLogs(username, page)
      if (result.code === 200) {
        setLogs(result.data.list || [])
        // 计算总页数
        const total = result.data.total || 0
        const pageSize = result.data.pageSize || 10
        setTotalPages(Math.ceil(total / pageSize))
      } else {
        showSnackbar('加载日志失败', 'error')
      }
    } catch (error) {
      showSnackbar('加载日志失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value)
  }

  const formatBytes = (bytes: string) => {
    const num = parseInt(bytes)
    if (isNaN(num)) return bytes
    if (num === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(num) / Math.log(k))
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatNumber = (num: string) => {
    const number = parseInt(num)
    if (isNaN(number)) return num
    return number.toLocaleString()
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Box sx={{ mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                穿透日志
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>用户名</TableCell>
                          <TableCell>端口</TableCell>
                          <TableCell>接收</TableCell>
                          <TableCell>发送</TableCell>
                          <TableCell>连接数</TableCell>
                          <TableCell>数据包数</TableCell>
                          <TableCell>时间</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.id}</TableCell>
                            <TableCell>{log.username}</TableCell>
                            <TableCell>{log.port}</TableCell>
                            <TableCell>{formatBytes(log.receive)}</TableCell>
                            <TableCell>{formatBytes(log.send)}</TableCell>
                            <TableCell>{formatNumber(log.connectNum)}</TableCell>
                            <TableCell>{formatNumber(log.packNum)}</TableCell>
                            <TableCell>{log.createTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {logs.length === 0 && (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                      <Typography variant="body1" color="text.secondary">
                        暂无日志数据
                      </Typography>
                    </Box>
                  )}

                  {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Box>

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