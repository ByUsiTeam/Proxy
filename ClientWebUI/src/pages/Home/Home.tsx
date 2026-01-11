// src/pages/Home/Home.tsx - 使用 Box 替代 Grid
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Link,
} from '@mui/material';
import {
  Public as PublicIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Http as HttpIcon,
  Domain as DomainIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { payAPI } from '../../services/api';
import type { PayItem } from '../../types';

const features = [
  {
    icon: <PublicIcon sx={{ fontSize: 40, color: '#3f51b5' }} />,
    title: '多端支持',
    description: 'Android端、Win、Linux、Mac、NAS、Docker等环境 X86、ARM、等CPU架构。',
  },
  {
    icon: <DomainIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
    title: '二级域名赠送',
    description: '注册的账号就是二级域名的名字，方便用户快速开发调试。',
  },
  {
    icon: <StorageIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
    title: '固定端口',
    description: '我们支持动态端口与固定端口模式，穿透FTP MYSQL Redis MQ等服务需要。',
  },
  {
    icon: <DomainIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
    title: '自定义域名',
    description: '我们支持用户自定义域名,只需要域名名字或者二级名字和账号名字一样就可以解析。',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#00bcd4' }} />,
    title: 'HTTPS支持',
    description: '支持用户自定义域名的同时在云厂商申请ssl证书如Nginx上配置https进行安全加密或者系统分配的域名也可以申请证书进行配置。',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40, color: '#f44336' }} />,
    title: '高性能',
    description: '我们使用HServer做为后台基石，在http协议上做了大量优化操作，通过SNI协议解析或者明文HOST解析。',
  },
];

const Home: React.FC = () => {
  const [payList, setPayList] = useState<PayItem[]>([]);

  useEffect(() => {
    loadPayList();
  }, []);

  const loadPayList = async () => {
    try {
      const response = await payAPI.getPayList();
      if (response.code === 200) {
        setPayList(response.data);
      }
    } catch (error) {
      console.error('Failed to load pay list:', error);
    }
  };

  return (
    <Box>
      {/* Banner */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            <strong>Proxy</strong> 内网穿透
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            我们支持TCP和UDP协议，针对 http/https ws/wss 协议做了大量的优化工作可以更加灵活的控制。让用户使用更佳舒服简单
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="https://gitee.com/byusi/proxy"
              target="_blank"
              rel="nofollow"
              sx={{
                color: 'white',
                textDecoration: 'none',
                bgcolor: 'rgba(255,255,255,0.2)',
                px: 2,
                py: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              开源地址
            </Link>
            <Link
              href="https://qm.qq.com/q/OTxfKEyDsI"
              target="_blank"
              rel="nofollow"
              sx={{
                color: 'white',
                textDecoration: 'none',
                bgcolor: 'rgba(255,255,255,0.2)',
                px: 2,
                py: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              QQ群：822726278
            </Link>
            <Link
              href="/login"
              rel="nofollow"
              sx={{
                color: "white",
                textDecoration: "none",
                bgcolor: "rgba(255,255,255,0.2)",
                px: 2,
                py: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              登录/注册
            </Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* 申明 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <HttpIcon />
              </Avatar>
              <Typography variant="h5">申明</Typography>
            </Box>
            <Typography variant="body1" sx={{ textIndent: '2em', lineHeight: 1.8 }}>
              本项目是一个公益项目，请各路大神不用恶意攻击，滥用资源，免费开源的项目真的不多
              使用服务器来进行内网穿透，下载对应的终端的软件包，下载安装免费使用，软件内没有任何的广告，放心使用，对软件有问题也可以加入交流群，进行咨询。
              软件系统，会自动清理一个月未登录登录的账号，如果出现账号不存在，或者登录失败问题，请进行重新注册使用。
              本软件可应用于远程办公、远程联调、接口联调、接口回调、公众号调试、本地开发微信、MySQL、TCP、UDP端口转发等一系列功能。
              软件永远免费，但禁止搭建，涉政治、色情、暴力、赌博、诈骗、影视、私、
              违反国家法律、给国家造成负面影响等等的网站，出现问题后果自负，本站概不负责。如有发现一律封号处理。
            </Typography>
          </CardContent>
        </Card>

        {/* 特色功能 */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          特色
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr'
          },
          gap: 3,
          mb: 6
        }}>
          {features.map((feature, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 2, mt: 0.5 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* 捐赠者 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              最新捐赠者(打赏请备注邮箱账号)
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                component="img"
                src="/img/pay.jpg"
                alt="支付二维码"
                sx={{
                  height: 300,
                  maxWidth: '100%',
                  borderRadius: 1,
                }}
              />
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr'
              },
              gap: 2
            }}>
              {payList.map((item, index) => (
                <Card key={index} variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {item.username}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ￥{item.price}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Home;