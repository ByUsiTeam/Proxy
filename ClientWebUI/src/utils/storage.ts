export const storage = {
  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },
  
  setUserInfo: (userInfo: any) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },
  
  removeUserInfo: () => {
    localStorage.removeItem('userInfo');
  },
  
  getShowPay: () => {
    return localStorage.getItem('showPay');
  },
  
  setShowPay: (value: string) => {
    localStorage.setItem('showPay', value);
  },
};