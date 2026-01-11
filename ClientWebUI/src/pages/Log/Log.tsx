// src/pages/Log/Log.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { statisticsAPI } from '../../services/api';
import { storage } from '../../utils/storage';
import type { LogItem } from '../../types';

const Log: React.FC = () => {
  const [logList, setLogList] = useState<LogItem[]>([]);
  const [, setLoading] = useState(false);

  const userInfo = storage.getUserInfo();

  useEffect(() => {
    if (userInfo) {
      loadLogs();
    }
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await statisticsAPI.getMyInfo(userInfo.username, 1);
      if (response.code === 200) {
        setLogList(response.data.list || []);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            穿透日志
          </Typography>
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
                {logList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.port}</TableCell>
                    <TableCell>{item.receive}字节</TableCell>
                    <TableCell>{item.send}字节</TableCell>
                    <TableCell>{item.connectNum}</TableCell>
                    <TableCell>{item.packNum}</TableCell>
                    <TableCell>{item.createTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Log;