const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message || 'Login failed';
    throw new Error(message);
  }

  return data;
}
