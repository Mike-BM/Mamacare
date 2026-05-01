# Hospital Integration Architecture

┌─────────────────────────────────────────┐
│              MAMACARE APP                │
│         (Mother's smartphone)            │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│           API GATEWAY                    │
│    (Secure, HIPAA-compliant routing)     │
└─────────────────────────────────────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Hospital │ │ Hospital │ │  Government  │
│   A      │ │   B      │ │   Health     │
│  EMR     │ │  EMR     │ │   Systems    │
│          │ │          │ │  (DHIS2, etc)│
└──────────┘ └──────────┘ └──────────────┘

## 1. Technical Integration Methods

### A. HL7 FHIR API (Modern Standard)
```javascript
// backend/services/hospitalIntegration.js
const { FHIRClient } = require('fhir-kit-client');

class HospitalIntegration {
  constructor(hospitalConfig) {
    this.client = new FHIRClient({
      baseUrl: hospitalConfig.fhirEndpoint,
      customHeaders: {
        'Authorization': `Bearer ${hospitalConfig.apiKey}`,
        'X-MamaCare-Source': 'mamacare-app'
      }
    });
  }

  // Send patient data to hospital EMR
  async syncPatientToEMR(patientData) {
    const fhirPatient = this.convertToFHIR(patientData);
    
    try {
      const result = await this.client.create({
        resourceType: 'Patient',
        body: fhirPatient
      });
      return { success: true, patientId: result.id };
    } catch (error) {
      console.error('FHIR sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get patient records from hospital
  async getPatientRecords(patientId) {
    const observations = await this.client.search({
      resourceType: 'Observation',
      searchParams: { patient: patientId, _sort: '-date' }
    });
    
    return this.convertFromFHIR(observations);
  }

  // Book appointment in hospital system
  async createAppointment(appointmentData) {
    const fhirAppointment = {
      resourceType: 'Appointment',
      status: 'booked',
      start: appointmentData.dateTime,
      participant: [
        {
          actor: { reference: `Patient/${appointmentData.patientId}` },
          status: 'accepted'
        },
        {
          actor: { reference: `Practitioner/${appointmentData.doctorId}` },
          status: 'accepted'
        }
      ],
      description: appointmentData.notes
    };

    return await this.client.create({
      resourceType: 'Appointment',
      body: fhirAppointment
    });
  }

  // Convert MamaCare data to FHIR format
  convertToFHIR(patientData) {
    return {
      resourceType: 'Patient',
      identifier: [{ system: 'mamacare', value: patientData.userId }],
      name: [{ given: [patientData.firstName], family: patientData.lastName }],
      telecom: [
        { system: 'phone', value: patientData.phone },
        { system: 'email', value: patientData.email }
      ],
      address: [{
        text: patientData.location,
        country: patientData.country
      }],
      extension: [
        {
          url: 'http://mamacare.africa/pregnancy-week',
          valueInteger: patientData.weeksPregnant
        },
        {
          url: 'http://mamacare.africa/due-date',
          valueDate: patientData.dueDate
        }
      ]
    };
  }
}

module.exports = HospitalIntegration;
```

### B. REST API Wrapper (For Legacy Systems)
```javascript
// For hospitals without FHIR support
class LegacyHospitalAdapter {
  constructor(hospitalConfig) {
    this.baseUrl = hospitalConfig.apiUrl;
    this.apiKey = hospitalConfig.apiKey;
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-MamaCare-Version': '1.0'
      }
    };

    if (data) options.body = JSON.stringify(data);

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    return await response.json();
  }

  // Get available slots
  async getAvailableSlots(doctorId, date) {
    return await this.makeRequest(
      `/appointments/slots?doctor=${doctorId}&date=${date}`
    );
  }

  // Book appointment
  async bookAppointment(slotId, patientData) {
    return await this.makeRequest(
      '/appointments/book',
      'POST',
      {
        slotId,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        patientPhone: patientData.phone,
        patientId: patientData.userId,
        notes: patientData.symptoms || ''
      }
    );
  }

  // Get patient history
  async getPatientHistory(patientPhone) {
    return await this.makeRequest(
      `/patients/history?phone=${encodeURIComponent(patientPhone)}`
    );
  }
}
```

### C. WhatsApp/SMS Fallback (For Low-Tech Hospitals)
```javascript
// For clinics with no digital system
class WhatsAppIntegration {
  constructor(twilioConfig) {
    this.client = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken);
    this.whatsappNumber = twilioConfig.whatsappNumber;
  }

  async sendAppointmentToClinic(clinicPhone, appointmentData) {
    const message = `
🏥 *New MamaCare Appointment*

*Patient:* ${appointmentData.patientName}
*Phone:* ${appointmentData.patientPhone}
*Date:* ${appointmentData.date}
*Time:* ${appointmentData.time}
*Type:* ${appointmentData.type}
*Weeks Pregnant:* ${appointmentData.weeksPregnant}
*Notes:* ${appointmentData.notes || 'None'}

Reply CONFIRM to accept
Reply RESCHEDULE to suggest new time
    `.trim();

    return await this.client.messages.create({
      from: `whatsapp:${this.whatsappNumber}`,
      to: `whatsapp:${clinicPhone}`,
      body: message
    });
  }

  async receiveClinicReply(incomingMessage) {
    const lower = incomingMessage.Body.toLowerCase();
    
    if (lower.includes('confirm')) {
      return { action: 'confirm', appointmentId: this.extractId(incomingMessage) };
    } else if (lower.includes('reschedule')) {
      return { action: 'reschedule', appointmentId: this.extractId(incomingMessage) };
    }
    
    return { action: 'unknown', message: incomingMessage.Body };
  }
}
```

## 2. Hospital Dashboard Features
```javascript
// Hospital-facing features
const hospitalDashboardFeatures = {
  // Real-time patient queue
  patientQueue: {
    incoming: 'Mothers arriving today',
    waiting: 'Currently in waiting area',
    withDoctor: 'In consultation',
    completed: 'Seen today'
  },

  // Risk flagging
  riskAlerts: {
    highBP: 'Auto-flag mothers with BP >140/90',
    missedAppointments: 'Flag no-shows for follow-up',
    emergencySOS: 'Real-time emergency alerts with GPS',
    aiTriage: 'Dr. Nneka high-risk assessments'
  },

  // Resource management
  resources: {
    bedAvailability: 'Real-time bed count',
    bloodBank: 'Current stock by type',
    orSchedule: 'Operating room availability',
    staffRoster: 'Who is on duty'
  },

  // Analytics
  analytics: {
    dailyVisits: 'Appointment volume trends',
    outcomes: 'Delivery outcomes tracking',
    riskFactors: 'Community health patterns',
    noShowRate: 'Missed appointment analytics'
  }
};
```

## 3. Integration Endpoints
```javascript
// backend/routes/hospital.js
const express = require('express');
const router = express.Router();

// Hospital registration
router.post('/register', async (req, res) => {
  const { name, licenseNumber, address, contactPerson, fhirEndpoint, apiType } = req.body;
  
  const hospital = await db.hospitals.create({
    name,
    licenseNumber,
    address,
    contactPerson,
    integrationConfig: {
      type: apiType, // 'fhir', 'rest', 'whatsapp', 'manual'
      endpoint: fhirEndpoint,
      status: 'pending_verification'
    }
  });
  
  // Send verification email to hospital admin
  await sendVerificationEmail(contactPerson.email, hospital.id);
  
  res.json({ hospitalId: hospital.id, status: 'pending' });
});

// Verify hospital
router.post('/verify/:hospitalId', async (req, res) => {
  const { hospitalId } = req.params;
  const { verificationCode } = req.body;
  
  const hospital = await db.hospitals.verify(hospitalId, verificationCode);
  
  // Test connection
  const integration = new HospitalIntegration(hospital.integrationConfig);
  const testResult = await integration.testConnection();
  
  res.json({ 
    verified: true, 
    connectionStatus: testResult.success ? 'active' : 'failed',
    nextSteps: testResult.success ? 'Start receiving patients' : 'Check API configuration'
  });
});

// Sync patient to hospital
router.post('/sync-patient', async (req, res) => {
  const { hospitalId, patientData } = req.body;
  
  const hospital = await db.hospitals.findById(hospitalId);
  const integration = new HospitalIntegration(hospital.integrationConfig);
  
  const result = await integration.syncPatientToEMR(patientData);
  
  // Log sync attempt
  await db.syncLogs.create({
    hospitalId,
    patientId: patientData.userId,
    status: result.success ? 'success' : 'failed',
    error: result.error || null
  });
  
  res.json(result);
});

// Get hospital availability
router.get('/availability/:hospitalId', async (req, res) => {
  const { hospitalId } = req.params;
  const { date, department } = req.query;
  
  const hospital = await db.hospitals.findById(hospitalId);
  const integration = new HospitalIntegration(hospital.integrationConfig);
  
  const availability = await integration.getAvailableSlots(department, date);
  
  res.json(availability);
});

// Receive emergency alert
router.post('/emergency-alert', async (req, res) => {
  const { hospitalId, patientData, location, symptoms, eta } = req.body;
  
  // Push to hospital emergency dashboard
  await io.to(`hospital-${hospitalId}`).emit('emergency', {
    patient: patientData,
    location,
    symptoms,
    eta,
    timestamp: new Date()
  });
  
  // Also send SMS to on-call doctor
  await sendEmergencySMS(hospitalId, patientData, location);
  
  res.json({ alertSent: true, estimatedArrival: eta });
});
```

## 4. Data Exchange Format
```javascript
// Standard data packet between MamaCare and hospitals
const patientDataPacket = {
  // Identification
  mamacareId: 'uuid-from-supabase',
  hospitalPatientId: 'hospital-internal-id', // null if new patient
  
  // Demographics
  name: { first: 'Sarah', last: 'Kimani' },
  phone: '+254712345678',
  email: 'sarah@email.com',
  dateOfBirth: '1995-03-15',
  location: { lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' },
  
  // Pregnancy data
  pregnancy: {
    weeksPregnant: 24,
    dueDate: '2026-08-15',
    gravida: 2, // number of pregnancies
    para: 1,    // number of births
    previousComplications: ['gestational_diabetes'],
    riskFactors: ['high_bp', 'advanced_maternal_age']
  },
  
  // Current visit
  currentVisit: {
    date: '2026-05-01',
    type: 'routine_checkup',
    symptoms: ['headache', 'swelling'],
    vitals: {
      bp: '135/85',
      weight: 72,
      temperature: 36.8,
      fetalHeartRate: 142
    },
    aiAssessment: {
      riskLevel: 'medium',
      recommendation: 'Monitor BP closely, schedule follow-up in 1 week'
    }
  },
  
  // History (summarized)
  history: {
    totalVisits: 8,
    lastVisit: '2026-04-15',
    medications: ['iron', 'folic_acid'],
    allergies: ['penicillin'],
    labResults: [
      { date: '2026-04-01', type: 'blood_work', result: 'normal' }
    ]
  }
};
```

## 5. Security & Compliance
```javascript
// middleware/hospitalSecurity.js
const hospitalSecurity = {
  // Encrypt all health data in transit
  encryptData: (data) => {
    return crypto.encrypt(JSON.stringify(data), process.env.HOSPITAL_DATA_KEY);
  },

  // Audit logging
  logAccess: async (hospitalId, userId, action, dataAccessed) => {
    await db.auditLogs.create({
      hospitalId,
      userId,
      action,
      dataAccessed: Object.keys(dataAccessed),
      timestamp: new Date(),
      ipAddress: req.ip
    });
  },

  // Consent verification
  verifyConsent: async (patientId, hospitalId, purpose) => {
    const consent = await db.consentRecords.findOne({
      patientId,
      hospitalId,
      purpose,
      status: 'active'
    });
    
    if (!consent || consent.expiresAt < new Date()) {
      throw new Error('Patient consent required');
    }
    
    return true;
  },

  // Data minimization
  filterData: (patientData, hospitalAccessLevel) => {
    const accessRules = {
      'emergency': ['name', 'phone', 'bloodType', 'allergies', 'pregnancy.weeks'],
      'routine': ['name', 'phone', 'pregnancy', 'history', 'vitals'],
      'specialist': ['all'] // full access with consent
    };
    
    const allowedFields = accessRules[hospitalAccessLevel] || accessRules['routine'];
    
    if (allowedFields.includes('all')) return patientData;
    
    // Return only allowed fields
    return Object.keys(patientData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = patientData[key];
        return obj;
      }, {});
  }
};
```

## 6. Onboarding Hospitals
| Step | Action | Timeline |
|---|---|---|
| 1 | Hospital applies via MamaCare partner portal | Day 1 |
| 2 | Verify license and credentials | Day 2-3 |
| 3 | Technical integration call (API docs shared) | Day 4 |
| 4 | Test environment setup | Day 5-7 |
| 5 | Pilot with 10-20 patients | Week 2 |
| 6 | Full integration and staff training | Week 3 |
| 7 | Go-live with marketing support | Week 4 |
