// src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { authAPI } from '../../services/api';
import { storage } from '../../utils/storage';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (storage.getUserInfo()) {
      navigate('/center');
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('邮箱和密码不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(username, password);
      if (response.code === 200) {
        storage.setUserInfo(response.data);
        if (response.data.level === 0) {
          storage.setShowPay('0');
        }
        navigate('/center');
      } else {
        setError(response.msg);
      }
    } catch (error: any) {
      setError(error.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!regUsername) {
      setError('邮箱不能为空');
      return;
    }

    try {
      const response = await authAPI.sendEmail(regUsername);
      if (response.code === 200) {
        alert('发送成功，请查收邮件，留意垃圾邮箱消息');
      } else {
        setError(response.msg);
      }
    } catch (error: any) {
      setError(error.message || '发送验证码失败');
    }
  };

  const handleRegister = async () => {
    if (!regUsername || !regPassword || !code) {
      setError('所有字段都必须填写');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(regUsername, regPassword, code);
      if (response.code === 200) {
        alert(response.msg);
        setRegisterOpen(false);
        setRegUsername('');
        setRegPassword('');
        setCode('');
      } else {
        setError(response.msg);
      }
    } catch (error: any) {
      setError(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Proxy内网穿透
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: '100%', mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => setLoginOpen(true)}
              sx={{ mb: 2 }}
            >
              登录
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setRegisterOpen(true)}
            >
              注册（更新密码）
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            我们支持TCP和UDP协议，针对 http/https ws/wss 协议做了大量的优化工作可以更加灵活的控制。
            让用户使用更佳舒服简单
          </Typography>
        </Paper>
      </Container>

      {/* 登录对话框 */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          登录
          <IconButton
            aria-label="close"
            onClick={() => setLoginOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="邮箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginOpen(false)}>取消</Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '登录'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 注册对话框 */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          创建新账号/更新密码
          <IconButton
            aria-label="close"
            onClick={() => setRegisterOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="邮箱"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              label="邮件验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button
              variant="outlined"
              onClick={handleSendCode}
              sx={{ minWidth: 100 }}
            >
              发送验证码
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterOpen(false)}>取消</Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '注册（更新密码）'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;