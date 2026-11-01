const BASE_URL = 'http://localhost:5000';

export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    removeToken();
    const errorMsg = data.error || 'Unauthorized - Invalid or expired token';
    const err = new Error(errorMsg);
    err.status = 401;
    throw err;
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Server returned error status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const registerUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(res);
  if (data.token) {
    setToken(data.token);
  }
  return data;
};

export const getMe = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  return handleResponse(res);
};

export const updateTask = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(res);
};

export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};
