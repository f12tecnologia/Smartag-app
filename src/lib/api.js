const API_BASE = '/api';

const getToken = () => localStorage.getItem('auth_token');

const setToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }
  
  return data;
};

export const auth = {
  signUp: async (email, password, options = {}) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: options.data?.full_name }),
    });
    setToken(data.token);
    return { user: data.user, error: null };
  },
  
  signIn: async (email, password) => {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return { user: data.user, error: null };
  },
  
  signOut: async () => {
    setToken(null);
    return { error: null };
  },
  
  getSession: async () => {
    const token = getToken();
    if (!token) {
      return { data: { session: null } };
    }
    try {
      const data = await apiRequest('/auth/session');
      return { data: { session: { user: data.user } } };
    } catch (error) {
      setToken(null);
      return { data: { session: null } };
    }
  },
  
  onAuthStateChange: (callback) => {
    const token = getToken();
    if (token) {
      auth.getSession().then(({ data }) => {
        callback('SIGNED_IN', data.session);
      });
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
};

export const qrCodes = {
  getAll: () => apiRequest('/qr-codes'),
  
  create: (data) => apiRequest('/qr-codes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiRequest(`/qr-codes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiRequest(`/qr-codes/${id}`, {
    method: 'DELETE',
  }),
  
  getRedirect: (id) => apiRequest(`/qr-codes/redirect/${id}`),
  
  getReports: (from, to) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return apiRequest(`/qr-codes/reports?${params.toString()}`);
  },
};

export const profile = {
  get: () => apiRequest('/profile'),
  
  update: (data) => apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const users = {
  getAll: () => apiRequest('/users'),
  
  invite: (data) => apiRequest('/users/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateRole: (id, role) => apiRequest(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

export default {
  auth,
  qrCodes,
  profile,
  users,
};
