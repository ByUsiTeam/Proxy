export interface UserInfo {
  id: string;
  username: string;
  level: number;
  password: string;
  tips: string;
  domains: Record<string, string>;
  ports: string[];
}

export interface PortItem {
  port: string;
}

export interface DomainItem {
  domain: string;
  customDomain: string;
}

export interface ProxyItem {
  Domain: string;
  ProxyServer: string;
  Server: string;
  Status: string;
}

export interface LogItem {
  id: string;
  username: string;
  port: string;
  receive: string;
  send: string;
  connectNum: string;
  packNum: string;
  createTime: string;
}

export interface AutoProxyItem {
  id: string;
  deviceId: string;
  userHost: string;
  serverHost: string;
  type: string;
  domain: string;
  port: string;
}

export interface ServerInfo {
  name: string;
  ip: string;
  port: string;
  num: number;
}

export interface PayItem {
  username: string;
  price: string;
}