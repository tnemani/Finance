import axios from 'axios';

const USERS_API_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api') + '/users';

export async function fetchUsers() {
  const res = await axios.get(USERS_API_URL);
  return res.data;
}
