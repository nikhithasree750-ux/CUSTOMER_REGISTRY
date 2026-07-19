const getBaseUrl = () => {
  // If we're running under the express server in production, api path is local.
  // Otherwise, use absolute backend path for local dev testing.
  if (typeof window !== 'undefined') {
    if (window.location.port === '5173') {
      return 'http://localhost:5001/api';
    }
  }
  return '/api';
};

const request = async (method, path, body = null, params = null) => {
  let url = `${getBaseUrl()}${path}`;
  
  if (params) {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (query) url += `?${query}`;
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

const api = {
  auth: {
    register: (data) => request('POST', '/users/register', data),
    login: (email, password) => request('POST', '/users/login', { email, password }),
    updateProfile: (data) => request('PUT', '/users/profile', data),
    changePassword: (data) => request('PUT', '/users/password', data)
  },
  customers: {
    getAll: (params) => request('GET', '/customers', null, params),
    getStats: () => request('GET', '/customers/stats'),
    create: (data) => request('POST', '/customers', data),
    update: (id, data) => request('PUT', `/customers/${id}`, data),
    delete: (id) => request('DELETE', `/customers/${id}`)
  },
  tickets: {
    getAll: (params) => request('GET', '/tickets', null, params),
    create: (data) => request('POST', '/tickets', data),
    update: (id, data) => request('PUT', `/tickets/${id}`, data),
    delete: (id) => request('DELETE', `/tickets/${id}`)
  },
  agents: {
    getAll: () => request('GET', '/agents'),
    create: (data) => request('POST', '/agents', data),
    update: (id, data) => request('PUT', `/agents/${id}`, data),
    delete: (id) => request('DELETE', `/agents/${id}`)
  },
  feedbacks: {
    getAll: () => request('GET', '/feedbacks'),
    create: (data) => request('POST', '/feedbacks', data)
  }
};

export default api;
