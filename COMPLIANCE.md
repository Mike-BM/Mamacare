# MamaCare Data Compliance & Sovereignty Manifest
**Version:** 1.0 (Kenya ODPC Compliant)
**Last Updated:** May 2026

## 1. Regulatory Status
MamaCare is registered with the **Office of the Data Protection Commissioner (ODPC) of Kenya** as a **Data Controller** and **Data Processor**.

## 2. Data Localization (Sovereignty)
To comply with Kenyan healthcare regulations, all sensitive patient health data (PHD) and financial records are localized within Africa:
- **Primary Database:** Supabase (PostgreSQL)
- **Region:** `af-south-1` (Africa - Cape Town)
- **Transit:** AES-256 TLS 1.3 Encrypted

## 3. Digital Consent Protocol
- **Onboarding:** No user (Mother or Hospital) can create an account without explicit digital consent.
- **Granularity:** Users can toggle anonymity for community discussions without affecting their medical record accuracy.

## 4. Breach Notification Policy (72-Hour Rule)
In the event of a suspected data breach:
1. **Detection:** Real-time monitoring via 'Mamacare Guardian'.
2. **Alerting:** Automated alerts sent to Security Officer via Slack/Email.
3. **Notification:** Formal report submitted to the ODPC within **72 hours** of discovery.
4. **Transparency:** Impacted users notified via the dashboard and registered email.

## 5. Right to Deletion
Mothers exercise total sovereignty over their health data.
- **Account Deletion:** Users can permanently delete their account and all associated health/financial records via the 'Danger Zone' in Settings.
- **Purge:** Deleted data is scrubbed from active databases within 24 hours.

---
*MamaCare: Building trust, protecting futures.*
