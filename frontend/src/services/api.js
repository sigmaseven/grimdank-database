import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic CRUD operations
export const createEntity = async (endpoint, data) => {
  const response = await api.post(`/${endpoint}`, data);
  return response.data;
};

export const getEntities = async (endpoint, params = {}) => {
  const response = await api.get(`/${endpoint}`, { params });
  return response.data;
};

export const getEntity = async (endpoint, id) => {
  const response = await api.get(`/${endpoint}/${id}`);
  return response.data;
};

export const updateEntity = async (endpoint, id, data) => {
  const response = await api.put(`/${endpoint}/${id}`, data);
  return response.data;
};

export const deleteEntity = async (endpoint, id) => {
  await api.delete(`/${endpoint}/${id}`);
};

// Specific entity services
export const rulesAPI = {
  create: (data) => createEntity('rules', data),
  getAll: (params) => getEntities('rules', params),
  getById: (id) => getEntity('rules', id),
  update: (id, data) => updateEntity('rules', id, data),
  delete: (id) => deleteEntity('rules', id),
  import: (data) => api.post('/import/rules', data).then(res => res.data),
};

export const weaponsAPI = {
  create: (data) => createEntity('weapons', data),
  getAll: (params) => getEntities('weapons', params),
  getById: (id) => getEntity('weapons', id),
  update: (id, data) => updateEntity('weapons', id, data),
  delete: (id) => deleteEntity('weapons', id),
  import: (data) => api.post('/import/weapons', data).then(res => res.data),
};

export const wargearAPI = {
  create: (data) => createEntity('wargear', data),
  getAll: (params) => getEntities('wargear', params),
  getById: (id) => getEntity('wargear', id),
  update: (id, data) => updateEntity('wargear', id, data),
  delete: (id) => deleteEntity('wargear', id),
  import: (data) => api.post('/import/wargear', data).then(res => res.data),
};

export const unitsAPI = {
  create: (data) => createEntity('units', data),
  getAll: (params) => getEntities('units', params),
  getById: (id) => getEntity('units', id),
  update: (id, data) => updateEntity('units', id, data),
  delete: (id) => deleteEntity('units', id),
  import: (data) => api.post('/import/units', data).then(res => res.data),
};

export const armyBooksAPI = {
  create: (data) => createEntity('armybooks', data),
  getAll: (params) => getEntities('armybooks', params),
  getById: (id) => getEntity('armybooks', id),
  update: (id, data) => updateEntity('armybooks', id, data),
  delete: (id) => deleteEntity('armybooks', id),
  import: (data) => api.post('/import/armybooks', data).then(res => res.data),
};

export const armyListsAPI = {
  create: (data) => createEntity('armylists', data),
  getAll: (params) => getEntities('armylists', params),
  getById: (id) => getEntity('armylists', id),
  update: (id, data) => updateEntity('armylists', id, data),
  delete: (id) => deleteEntity('armylists', id),
  import: (data) => api.post('/import/armylists', data).then(res => res.data),
};

export default api;
