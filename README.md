# Campus Care

> **"Your Campus. Your Safety. Your Community."**

A production-grade, real-time campus safety and emergency assistance web application built for the **Engineering Day Rapid-Coding Competition**. Campus Care provides instant emergency dispatch, clinical triage, fire suppression response, and live administrative safety supervision across university campuses.

---

## 🌟 Key Features

### 1. 🚨 Critical SOS System (1-Tap Emergency Dispatch)
- **Instant Activation**: Floating action button (FAB) accessible globally with accessible confirmation modal.
- **Non-Blocking Geolocation**: Captures real-time GPS coordinates with instant fallback if location access is blocked or unavailable.
- **Duplicate Emergency Protection**: Prevents multi-tap spam while preserving immediate access to the active emergency lifecycle.
- **Real-Time Dispatch**: Instant multi-channel notifications to campus security and dispatch command center.

### 2. 🩺 Medical Emergency & Clinical Triage
- **Structured Assistance Flow**: Dynamic severity triage (🟢 Low, 🟡 Moderate, 🟠 High, 🔴 Critical).
- **Clinical Details**: Symptom selector chips, custom injury descriptions, and explicit ambulance requirement indicators.
- **Dedicated Responder Console**: Specialized medical worker station (`/medical`) for patient vitals, clinical response tracking, and ambulance coordination.
- **HIPAA-Inspired Data Privacy**: Strict Row-Level Security policies restricting medical details exclusively to patient, medical personnel, and campus administrators.

### 3. 🔥 Fire Emergency & Hazard Management
- **Multi-Hazard Categorization**: Specific dispatch flows for Active Fire, Smoke/Odor, Electrical Hazard, Gas Leak, and Hazardous Spills.
- **Life-Safety Trapped Occupants Logic**: Deterministic critical-priority elevation when occupants are trapped, complete with pulsing danger callouts and mandatory confirmation checkboxes.
- **Dedicated Fire Station**: Real-time worker dashboard (`/fire`) with rapid-response action controls (*Accept Incident*, *Deploy Suppression*, *Resolve Incident*).
- **Smoke & Evacuation Guidance**: Context-aware safety instructions (evacuation stairwells, gas shutoff safety, electrical caution).

### 4. 👥 Role-Based Access Control (RBAC)
Supports 7 distinct campus roles with granular dashboard views and route protections:
- 🎓 **Student Dashboard**: Emergency requests, campus alerts, safe routes, and personal incident history.
- 📚 **Teacher Dashboard**: Classroom safety status, roll-call attendance, and rapid facility assistance.
- 🏛️ **Faculty / Staff Dashboard**: Departmental safety oversight and facility reporting.
- 👮 **Campus Security Dashboard**: Security patrol dispatch, perimeter monitoring, and guard status.
- 🚑 **Medical Worker Dashboard**: Ambulance coordination, patient triage queue, and clinical notes.
- 🚒 **Fire Safety Worker Dashboard**: Suppression status, hazard logs, and trapped occupant alerts.
- 🛡️ **Chief Administrator (SOC)**: Command & Safety Control center with campus map, live broadcast feed, responder duty tracking, and incident inspection modals.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS design tokens
- **Routing**: React Router (DOM)
- **Icons**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL 15+)
- **Security**: Supabase Row Level Security (RLS) policies with Postgres functions
- **Realtime**: Supabase Realtime Channels (PostgreSQL WAL streaming) + local cross-tab fallback
- **State Management & Data**: Custom React Hooks (`useAuth`, `useSOS`, `useMedicalEmergency`, `useFireEmergency`, `useEmergencyRealtime`)

---

## 📂 Project Structure

```
campus-care/
├── src/
│   ├── components/
│   │   ├── emergency/        # SOS cards, timelines, worker action modals, duty toggles
│   │   ├── medical/          # Medical form, severity selector, triage cards, responder modal
│   │   ├── fire/             # Fire form, hazard selector, fire responder card, suppression modal
│   │   ├── ui/               # Reusable Button, Card, StatCard, Badges, PageHeader
│   │   ├── GlobalSOSButton.tsx
│   │   └── MapContainer.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Supabase Auth + mock demo fallback
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSOS.ts
│   │   ├── useMedicalEmergency.ts
│   │   ├── useFireEmergency.ts
│   │   ├── useEmergencyRealtime.ts
│   │   └── useNotificationRealtime.ts
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── lib/
│   │   ├── services/         # emergencyService, medicalService, fireService, notificationService
│   │   ├── supabase.ts
│   │   ├── env.ts
│   │   └── mockData.ts
│   ├── pages/                # Admin, Student, Teacher, Faculty, Worker, Emergency, Login, Register
│   ├── types/
│   │   └── database.ts       # Supabase TypeScript schema definitions
│   ├── App.tsx               # Route declarations and role-protected routing
│   └── main.tsx
├── supabase/
│   └── migrations/           # 12 production SQL migrations (schema, RLS, triggers, functions)
├── package.json
└── vite.config.ts
```

---

## 🗄️ Database Architecture (Supabase)

Includes 12 structured migrations in `supabase/migrations/`:
1. `001_create_profiles_table.sql` — Profiles with user roles (`student`, `teacher`, `faculty`, `worker`, `admin`)
2. `002_create_worker_tables.sql` — Responder departments (`security`, `medical`, `fire`) and duty status
3. `003_create_incident_enums.sql` — Enum types for incident types, statuses, and priorities
4. `004_create_emergency_tables.sql` — Core incidents, medical extension, and fire extension tables
5. `005_create_assignment_tables.sql` — Incident assignments and responder dispatch tracking
6. `006_create_security_tables.sql` — Safe routes, hazard reports, and campus zones
7. `007_create_notification_tables.sql` — System and push broadcast notifications
8. `008_create_support_tables.sql` — Chat, mental health, and facility maintenance requests
9. `009_create_indexes.sql` — Spatial and status performance indexes
10. `010_create_audit_tables.sql` — Audit logs and compliance trails
11. `011_helper_functions.sql` — SQL helper functions (`get_user_role()`, `get_worker_dept()`)
12. `012_rls_policies.sql` — Strict Row-Level Security policies for all tables

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/habib404ahmed/Campus-Care.git
   cd Campus-Care
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Supabase URL and Anon Key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Note: The app includes full local storage fallback mode with simulated realtime cross-tab synchronization if Supabase credentials are not supplied).*

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Developed for the Engineering Day Competition. All rights reserved.
