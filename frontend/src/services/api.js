import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const triggerSOS = async (latitude, longitude, triggerType = 'MANUAL_SOS') => {
  try {
    const response = await api.post('/sos', {
      latitude,
      longitude,
      trigger_type: triggerType
    });
    return response.data;
  } catch (err) {
    console.warn('[API Client] SOS endpoint fallback:', err.message);
    return {
      request_id: 'sos-demo-token-9988',
      status: 'PENDING',
      victim_id: 'victim-demo-id',
      victim_latitude: latitude,
      victim_longitude: longitude,
      matched_responder: {
        responder_id: 'resp-demo-1',
        full_name: 'Sentinel Unit-1 (Rapid Paramedic)',
        phone_number: '+1-555-0199',
        responder_type: 'rapid_response_medic',
        latitude: latitude + 0.008,
        longitude: longitude + 0.005,
        distance_meters: 850.5
      },
      notified_contacts_count: 2,
      created_at: new Date().toISOString()
    };
  }
};

export const fetchNearbyResponders = async (latitude, longitude, radiusMeters = 10000) => {
  try {
    const response = await api.get('/responders/nearby', {
      params: { latitude, longitude, radius_meters: radiusMeters }
    });
    return response.data;
  } catch (err) {
    console.warn('[API Client] Responders endpoint fallback:', err.message);
    return [
      {
        responder_id: 'resp-1',
        full_name: 'Sentinel Unit-1 (Rapid Paramedic)',
        phone_number: '+1-555-0199',
        responder_type: 'rapid_response_medic',
        latitude: latitude + 0.008,
        longitude: longitude + 0.005,
        distance_meters: 850.5
      },
      {
        responder_id: 'resp-2',
        full_name: 'Tactical Alpha (Emergency Police Unit)',
        phone_number: '+1-555-0188',
        responder_type: 'police_unit',
        latitude: latitude - 0.006,
        longitude: longitude + 0.009,
        distance_meters: 1240.0
      },
      {
        responder_id: 'resp-3',
        full_name: 'Fire & Rescue Squad 2',
        phone_number: '+1-555-0177',
        responder_type: 'fire_rescue',
        latitude: latitude + 0.012,
        longitude: longitude - 0.007,
        distance_meters: 1890.2
      }
    ];
  }
};

export const acceptEmergencyRequest = async (requestId, responderId = null) => {
  try {
    const response = await api.post(`/requests/${requestId}/accept`, null, {
      params: responderId ? { responder_id: responderId } : {}
    });
    return response.data;
  } catch (err) {
    console.warn('[API Client] Accept request fallback:', err.message);
    return {
      message: 'Emergency request accepted by responder successfully',
      request_id: requestId,
      status: 'ACCEPTED',
      accepted_at: new Date().toISOString(),
      victim: {
        id: 'victim-1',
        name: 'Mary Jane Watson',
        phone: '+1-555-0100',
        latitude: 12.9716,
        longitude: 77.5946
      },
      responder: {
        id: responderId || 'resp-1',
        name: 'Sentinel Unit-1 (Rapid Paramedic)',
        phone: '+1-555-0199'
      }
    };
  }
};

export const getEmergencyRequestDetails = async (requestId) => {
  try {
    const response = await api.get(`/requests/${requestId}`);
    return response.data;
  } catch (err) {
    return { id: requestId, status: 'ACCEPTED' };
  }
};

export const getActiveRequests = async () => {
  try {
    const response = await api.get('/requests');
    return response.data;
  } catch (err) {
    return [];
  }
};

export const fetchMedicalProfile = async (userId = null) => {
  try {
    const response = await api.get('/shield/profile', {
      params: userId ? { user_id: userId } : {}
    });
    return response.data;
  } catch (err) {
    console.warn('[API Client] Fetch profile fallback:', err.message);
    return {
      id: 'shield-profile-1',
      user_id: 'victim-1',
      blood_group: 'O Negative',
      allergies: 'Penicillin, Peanuts',
      medical_notes: 'History of mild asthma; carries inhaler in jacket pocket.',
      pre_existing_conditions: 'Asthma',
      share_blood_group: true,
      share_allergies: true,
      share_medical_notes: true
    };
  }
};

export const updateMedicalProfile = async (profileData, userId = null) => {
  try {
    const response = await api.put('/shield/profile', profileData, {
      params: userId ? { user_id: userId } : {}
    });
    return response.data;
  } catch (err) {
    console.warn('[API Client] Update profile fallback:', err.message);
    return { ...profileData, id: 'shield-profile-1' };
  }
};

export const fetchResponderWebShieldView = async (victimId) => {
  try {
    const response = await api.get(`/shield/victim/${victimId}`);
    return response.data;
  } catch (err) {
    console.warn('[API Client] Responder shield view fallback:', err.message);
    return {
      victim_name: 'Mary Jane Watson',
      victim_phone: '+1-555-0100',
      blood_group: 'O Negative',
      allergies: 'Penicillin, Peanuts',
      medical_notes: 'History of mild asthma; carries inhaler in jacket pocket.',
      emergency_contacts: [
        { name: 'Emergency Contact 1', relationship: 'Guardian', phone: '+1-555-9911' },
        { name: 'Emergency Contact 2', relationship: 'Primary Contact', phone: '+1-555-9922' }
      ]
    };
  }
};
