const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 对于文本响应，直接返回文本
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/plain')) {
        return response.text() as unknown as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async login(username: string, password: string): Promise<any> {
    return this.request('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static async register(username: string, password: string, code: string): Promise<any> {
    return this.request('/user/reg', {
      method: 'POST',
      body: JSON.stringify({ username, password, code }),
    });
  }

  static async sendEmailCode(username: string): Promise<any> {
    return this.request(`/user/email?username=${username}`);
  }

  static async getServices(): Promise<any> {
    return this.request('/server/info');
  }

  static async addService(data: any): Promise<any> {
    return this.request('/server/proxy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async stopService(domain: string): Promise<any> {
    return this.request(`/server/stop?domain=${domain}`);
  }

  static async checkCoreVersion(): Promise<any> {
    return this.request('/core/version');
  }

  static async getServers(): Promise<any> {
    return this.request('/load/data');
  }

  static async getDeviceInfo(): Promise<any> {
    return this.request('/device/info');
  }

  static async getProxyConfigs(userId: string): Promise<any> {
    return this.request(`/config/list?userId=${userId}`);
  }

  static async saveProxyConfig(data: any): Promise<any> {
    return this.request('/config/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async removeProxyConfig(id: string): Promise<any> {
    return this.request(`/config/remove?id=${id}`);
  }

  static async getDomains(userId: string): Promise<any> {
    return this.request(`/server/domainList?userId=${userId}`);
  }

  static async addDomain(data: any): Promise<any> {
    return this.request('/server/domainAdd', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async removeDomain(userId: string, domain: string): Promise<any> {
    return this.request('/server/domainRemove', {
      method: 'POST',
      body: JSON.stringify({ userId, domain }),
    });
  }

  static async getPorts(userId: string): Promise<any> {
    return this.request(`/server/portList?userId=${userId}`);
  }

  static async addPort(data: any): Promise<any> {
    return this.request('/server/portAdd', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async removePort(userId: string, port: string): Promise<any> {
    return this.request('/server/portRemove', {
      method: 'POST',
      body: JSON.stringify({ userId, port }),
    });
  }

  static async getLogs(username: string, page: number = 1): Promise<any> {
    return this.request(`/statistics/getMyInfo?username=${username}&page=${page}`);
  }

  static async getDonations(): Promise<any> {
    return this.request('/server/pay');
  }
}