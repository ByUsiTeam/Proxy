// src/pages/Port/Port.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { serverAPI } from '../../services/api';
import { storage } from '../../utils/storage';
import type { PortItem } from '../../types';

const Port: React.FC = () => {
  const [portList, setPortList] = useState<PortItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userInfo = storage.getUserInfo();

  useEffect(() => {
    if (userInfo) {
      loadPortList();
    }
  }, []);

  const loadPortList = async () => {
    try {
      const response = await serverAPI.portList(userInfo.id);
      if (response.code === 200) {
        setPortList(response.data);
      }
    } catch (error) {
      console.error('Failed to load port list:', error);
    }
  };

  const handleAddPort = async () => {
    if (!port.trim()) {
      setError('外网端口不能为空');
      return;
    }

    if (!userInfo) return;

    setLoading(true);
    setError('');

    try {
      const response = await serverAPI.portAdd(userInfo.id, port);
      if (response.code === 200) {
        alert(response.msg);
        setDialogOpen(false);
        setPort('');
        loadPortList();
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

  const handleDeletePort = async (port: string) => {
    if (!userInfo) return;

    if (window.confirm(`确定要删除端口 ${port} 吗？`)) {
      try {
        const response = await serverAPI.portRemove(userInfo.id, port);
        alert(response.msg);
        loadPortList();
        reloadUserInfo();
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

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          添加端口
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>端口</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.port}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeletePort(item.port)}
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

      {/* 添加端口对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>添加端口</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="外网端口"
            type="text"
            fullWidth
            value={port}
            onChange={(e) => setPort(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddPort();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAddPort}
            variant="contained"
            disabled={loading}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Port;