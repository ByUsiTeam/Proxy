// src/pages/Domain/Domain.tsx
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
import type { DomainItem } from '../../types';

const Domain: React.FC = () => {
  const [domainList, setDomainList] = useState<DomainItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    customDomain: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userInfo = storage.getUserInfo();

  useEffect(() => {
    if (userInfo) {
      loadDomainList();
    }
  }, []);

  const loadDomainList = async () => {
    try {
      const response = await serverAPI.domainList(userInfo.id);
      if (response.code === 200) {
        setDomainList(response.data);
      }
    } catch (error) {
      console.error('Failed to load domain list:', error);
    }
  };

  const handleAddDomain = async () => {
    if (!formData.domain.trim()) {
      setError('二级域名不能为空');
      return;
    }

    if (!userInfo) return;

    setLoading(true);
    setError('');

    try {
      const response = await serverAPI.domainAdd(
        userInfo.id,
        formData.domain,
        formData.customDomain || undefined
      );
      if (response.code === 200) {
        alert(response.msg);
        setDialogOpen(false);
        setFormData({ domain: '', customDomain: '' });
        loadDomainList();
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

  const handleDeleteDomain = async (domain: string) => {
    if (!userInfo) return;

    if (window.confirm(`确定要删除域名 ${domain} 吗？`)) {
      try {
        const response = await serverAPI.domainRemove(userInfo.id, domain);
        alert(response.msg);
        loadDomainList();
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
          添加域名
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>二级名</TableCell>
                  <TableCell>自定义域名</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domainList.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.domain}</TableCell>
                    <TableCell>{item.customDomain || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteDomain(item.domain)}
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

      {/* 添加域名对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>添加域名</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="二级域名"
            helperText="二级域名(只是一个名字)"
            type="text"
            fullWidth
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="自定义域名"
            helperText="自定义域名(如:www.cdifit.com),非必填"
            type="text"
            fullWidth
            value={formData.customDomain}
            onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddDomain();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAddDomain}
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

export default Domain;