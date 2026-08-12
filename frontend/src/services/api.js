import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const triggerSOS = async (latitude, longitude, triggerType = 'MANUAL_SOS') => {
  const response = await api.post('/sos', {
    latitude,
    longitude,
    trigger_type: triggerType
  });
  return response.data;
};

export const fetchNearbyResponders = async (latitude, longitude, radiusMeters = 10000) => {
  const response = await api.get('/responders/nearby', {
    params: { latitude, longitude, radius_meters: radiusMeters }
  });
  return response.data;
};

export const acceptEmergencyRequest = async (requestId, responderId = null) => {
  const response = await api.post(`/requests/${requestId}/accept`, null, {
    params: responderId ? { responder_id: responderId } : {}
  });
  return response.data;
};

export const getEmergencyRequestDetails = async (requestId) => {
  const response = await api.get(`/requests/${requestId}`);
  return response.data;
};

export const getActiveRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const fetchMedicalProfile = async (userId = null) => {
  const response = await api.get('/shield/profile', {
    params: userId ? { user_id: userId } : {}
  });
  return response.data;
};

export const updateMedicalProfile = async (profileData, userId = null) => {
  const response = await api.put('/shield/profile', profileData, {
    params: userId ? { user_id: userId } : {}
  });
  return response.data;
};

export const fetchResponderWebShieldView = async (victimId) => {
  const response = await api.get(`/shield/victim/${victimId}`);
  return response.data;
};
