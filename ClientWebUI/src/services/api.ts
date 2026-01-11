// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 响应数据类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface ProxyResponse {
  Domain: string;
  ProxyServer: string;
  Server: string;
  Status: string;
}

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (e) {
        console.error('Failed to parse user info');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API接口定义
export const authAPI = {
  login: (username: string, password: string): Promise<ApiResponse> =>
    api.post('/user/login', { username, password }),
  
  register: (username: string, password: string, code: string): Promise<ApiResponse> =>
    api.post('/user/reg', { username, password, code }),
  
  sendEmail: (username: string): Promise<ApiResponse> =>
    api.get('/user/email', { params: { username } }),
};

export const serverAPI = {
  portList: (userId: string): Promise<ApiResponse<any[]>> =>
    api.get('/server/portList', { params: { userId } }),
  
  portAdd: (userId: string, port: string): Promise<ApiResponse> =>
    api.post('/server/portAdd', { userId, port }),
  
  portRemove: (userId: string, port: string): Promise<ApiResponse> =>
    api.post('/server/portRemove', { userId, port }),
  
  domainList: (userId: string): Promise<ApiResponse<any[]>> =>
    api.get('/server/domainList', { params: { userId } }),
  
  domainAdd: (userId: string, domain: string, customDomain?: string): Promise<ApiResponse> =>
    api.post('/server/domainAdd', { userId, domain, customDomain }),
  
  domainRemove: (userId: string, domain: string): Promise<ApiResponse> =>
    api.post('/server/domainRemove', { userId, domain }),
  
  loadData: (): Promise<ApiResponse<any[]>> =>
    api.get('/load/data'),
  
  proxyList: (): Promise<ProxyResponse[]> =>
    api.get('/server/info').then(res => res as any as ProxyResponse[]),
  
  stopProxy: (domain: string): Promise<any> =>
    api.get('/server/stop', { params: { domain } }),
  
  startProxy: (data: any): Promise<any> =>
    api.post('/server/proxy', data),
  
  checkCore: (): Promise<any> =>
    api.get('/core/version'),
  
  // 添加 login 方法
  login: (username: string, password: string): Promise<ApiResponse> =>
    api.post('/user/login', { username, password }),
};

export const statisticsAPI = {
  getMyInfo: (username: string, page: number = 1): Promise<ApiResponse<{list: any[]}>> =>
    api.get('/statistics/getMyInfo', { params: { username, page } }),
};

export const configAPI = {
  list: (userId: string): Promise<ApiResponse<any[]>> =>
    api.get('/config/list', { params: { userId } }),
  
  save: (data: any): Promise<ApiResponse> =>
    api.post('/config/save', data),
  
  remove: (id: string): Promise<ApiResponse> =>
    api.get('/config/remove', { params: { id } }),
};

export const deviceAPI = {
  getInfo: (): Promise<string> =>
    api.get('/device/info').then(res => res as unknown as string),
};

export const payAPI = {
  getPayList: (): Promise<ApiResponse<any[]>> =>
    api.get('/server/pay'),
};

export default api;