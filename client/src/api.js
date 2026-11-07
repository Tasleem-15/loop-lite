const API_BASE = '/api';

/**
 * Fetch wrapper that attaches the JWT Bearer token and parses errors
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('loop_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(name, email, password, role) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  // Feedback
  async getFeedback({ search, sentiment, status } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sentiment && sentiment !== 'all') params.append('sentiment', sentiment);
    if (status && status !== 'all') params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/feedback${query}`);
  },

  async addFeedback({ content, channel }) {
    return request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ content, channel })
    });
  },

  async updateFeedbackStatus(id, status) {
    return request(`/feedback/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async deleteFeedback(id) {
    return request(`/feedback/${id}`, {
      method: 'DELETE'
    });
  },

  // Stats
  async getStats() {
    return request('/stats');
  }
};
