export interface UserInfo {
  id: string;
  username: string;
  password: string;
  level: number;
  tips: string;
  domains: Record<string, any>;
  ports: string[];
}

export interface Service {
  Domain: string;
  ProxyServer: string;
  Server: string;
  Status: string;
}

export interface ServerInfo {
  ip: string;
  port: number;
  name: string;
  num: number;
}

export interface ProxyConfig {
  id: string;
  deviceId: string;
  userHost: string;
  serverHost: string;
  type: string;
  domain: string;
  port: string;
}

export interface DomainConfig {
  domain: string;
  customDomain: string;
}

export interface PortConfig {
  port: string;
}

export interface LogEntry {
  id: string;
  username: string;
  port: string;
  receive: string;
  send: string;
  connectNum: string;
  packNum: string;
  createTime: string;
}

export interface DonationItem {
  username: string;
  price: string;
}