# NAWI — OIML R76 Compliance System

### Digital Test, Evaluation & Report Generation System for Non-Automatic Weighing Instruments

NAWI is a web-based application designed to digitize the testing, evaluation, review, and reporting workflow for **Non-Automatic Weighing Instruments (NAWI)** in accordance with **OIML Recommendation R 76**.

The system replaces manual spreadsheets and disconnected report templates with a structured digital workflow that supports instrument registration, test execution, automatic calculations, evidence management, authority review, and report generation.

---

## Problem

Testing and evaluation of Non-Automatic Weighing Instruments can involve a large number of observations, calculations, acceptance criteria, and supporting documents.

When these activities are handled manually using spreadsheets and document templates, several problems can occur:

* Repeated manual calculations
* Calculation errors
* Inconsistent test reporting
* Difficulty tracking evaluation status
* Manual preparation of test reports
* Difficulty maintaining supporting evidence
* Limited separation between testing and regulatory review
* Difficulty maintaining a clear evaluation history

NAWI addresses these problems by providing a centralized digital evaluation workflow.

---

## Solution

NAWI provides a complete digital workflow:

```text
Register Instrument
        ↓
Create Evaluation
        ↓
Configure Test Conditions
        ↓
Perform Applicable Tests
        ↓
Automatic Calculations
        ↓
PASS / FAIL Evaluation
        ↓
Upload Supporting Evidence
        ↓
Submit for Authority Review
        ↓
Authority Review
   ┌────┴────┐
   ↓         ↓
Approve    Return for Correction
   ↓         ↓
Finalize   Tester Corrects
   ↓         ↓
Final Record ← Resubmit
        ↓
Generate Test Report
```

Reports remain available as generated documents and are not blocked simply because an individual test has failed.

---

## Key Features

### Instrument Management

Register and maintain instrument information such as:

* Manufacturer
* Model / Type
* Serial Number
* Accuracy Class
* Instrument category
* Indication type
* Maximum capacity
* Minimum capacity
* Verification scale interval (`e`)
* Actual scale interval (`d`)
* Maximum tare
* Number of verification intervals (`n`)
* Software identification
* Software version
* Connected modules

---

### OIML R76 Test Evaluation

The system provides structured test workflows for applicable OIML R76 tests, including tests such as:

* Warm-up
* Zero return
* Repeatability
* Eccentricity
* Discrimination
* Tare
* Temperature
* Voltage
* Creep
* Stability of equilibrium
* Span stability
* Damp heat
* Electromagnetic compatibility
* Endurance where applicable
* Other applicable instrument tests

Tests are evaluated according to the instrument configuration and applicable acceptance criteria.

---

### Automatic Calculations

NAWI performs calculations required during evaluation instead of requiring the tester to manually calculate every result.

Examples include:

```text
n = Max / e
```

```text
P = I + 0.5e − ΔL
```

```text
E = P − L
```

```text
Ec = E − E0
```

The calculated result is compared with the applicable Maximum Permissible Error (MPE) to determine the test outcome.

---

### PASS / FAIL / Not Applicable

Each test can result in:

* PASS
* FAIL
* NOT TESTED
* NOT APPLICABLE

Not-applicable tests are excluded from compliance counts.

The overall evaluation is determined from the applicable test results.

---

### Evidence Management

Testers can attach supporting evidence to evaluations and individual tests.

Evidence can include:

* Test photographs
* Instrument photographs
* Measurement evidence
* Supporting documents
* Other test-related files

Evidence can be reviewed together with the corresponding evaluation.

---

### Tester & Authority Workflow

NAWI separates testing from regulatory review.

#### Tester

The Tester can:

* Register instruments
* Create evaluations
* Perform tests
* Enter observations
* View automatic calculations
* Upload evidence
* Generate reports
* Submit evaluations for review
* Correct rejected evaluations
* View evaluation history

#### Authority

The Authority can:

* View submitted evaluations
* Review test results
* Inspect supporting evidence
* Review compliance status
* Add review remarks
* Approve evaluations
* Return evaluations for correction
* Finalize approved evaluations
* View finalized records

The Authority does not directly modify the tester's measurements.

---

## Evaluation Status

An evaluation follows a controlled workflow:

```text
DRAFT
  ↓
IN PROGRESS
  ↓
SUBMITTED FOR REVIEW
  ↓
UNDER REVIEW
  ├───────────────┐
  ↓               ↓
APPROVED       REJECTED
  ↓               ↓
FINALIZED      CORRECTION
                  ↓
              RESUBMITTED
```

This provides a clear separation between testing, review, correction, and finalization.

---

## Report Generation

NAWI can generate evaluation reports directly from the recorded evaluation data.

The generated report can contain:

* Instrument information
* Evaluation information
* Test results
* Calculated values
* PASS / FAIL results
* Applicable / non-applicable tests
* Environmental conditions
* Supporting evidence
* Authority review information
* Finalization information

Reports can be generated in:

* PDF
* Microsoft Word

Report generation is independent from finalization, allowing reports to be generated for completed evaluations even when the evaluation contains failed tests.

---

## Sample Data

To make demonstrations and testing easier, NAWI includes an **Auto-Fill Sample Data** feature.

Instead of manually entering realistic values for every test, the tester can populate forms with sample scenarios.

Sample scenarios include:

* Clean PASS
* Small positive variation
* Small negative variation
* Near MPE
* Mixed results
* Repeatability
* Boundary values
* Low-load conditions
* High-load conditions
* Slightly varied readings
* Intentional FAIL scenario

This makes the system easier to demonstrate during testing, judging, and development.

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Lucide Icons

### Backend

* Python
* FastAPI
* REST API architecture

### Database

* PostgreSQL
* Supabase

### Reporting

* PDF report generation
* Microsoft Word report generation

### Regulatory Logic

The application contains structured rule and calculation logic based on applicable requirements from **OIML R 76** and the project's regulatory reference material.

---

## Project Structure

```text
NAWI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── regulatory/
│   │   ├── tests_engine/
│   │   └── reports/
│   │
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── constants/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Example Instrument

The prototype can be demonstrated using a Class III digital platform scale.

```text
Manufacturer:
Apex Weigh Systems Pvt. Ltd.

Model:
AWS-150 Digital Platform Scale

Serial:
AWS150-2026-014

Accuracy Class:
Class III

Maximum Capacity:
150.000 kg

Minimum Capacity:
1.000 kg

Verification Scale Interval:
0.050 kg

Actual Scale Interval:
0.010 kg

Maximum Tare:
30.000 kg

Number of Verification Intervals:
3000
```

---

## Regulatory Reference

The primary technical reference for the evaluation logic is:

**OIML Recommendation R 76 — Non-automatic weighing instruments**

The project also considers relevant Indian Legal Metrology regulatory material used for the intended workflow and prototype.

The implementation is intended as a **digital prototype** and should be validated by the appropriate regulatory authority and metrology experts before being used for official legal certification or statutory decisions.

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* Python 3.11+
* Git
* PostgreSQL / Supabase project

---

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/NAWI-OIML-R76-Compliance-System.git
cd NAWI-OIML-R76-Compliance-System
```

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file containing the required frontend environment variables.

Then start the development server:

```bash
npm run dev
```

---

### Backend Setup

Open another terminal:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required backend environment variables in:

```text
backend/.env
```

Then start the API:

```bash
python run.py
```

---

## Environment Variables

Sensitive environment variables should **never be committed to GitHub**.

Use `.env.example` files to document required variables without exposing real credentials.

Example:

```env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Backend environment variables should be configured separately for the deployed backend.

---

## Security

The repository should not contain:

* Database passwords
* API keys
* Supabase service-role keys
* JWT secrets
* Production credentials
* Private certificates
* Uploaded evidence files

These values should be stored in environment variables or the deployment platform's secret management system.

---

## Future Improvements

Potential future enhancements include:

* Digital signatures
* Advanced audit trails
* More detailed equipment management
* Automated regulatory rule updates
* Additional instrument configurations
* Role-based authentication
* Advanced authority dashboards
* Centralized evidence storage
* Report templates for different regulatory workflows
* Deployment monitoring and logging

---

## Project Goal

The goal of NAWI is to demonstrate how a traditionally manual metrology evaluation workflow can be transformed into a structured digital system.

The project combines:

```text
Regulatory Requirements
        +
Engineering Calculations
        +
Test Workflows
        +
Evidence Management
        +
Authority Review
        +
Automated Reporting
        =
Digital NAWI Compliance System
```

---

## Disclaimer

NAWI is a software prototype developed for demonstration, development, and evaluation purposes.

It is not intended to replace official Legal Metrology procedures, authorized testing laboratories, statutory verification processes, or regulatory approval systems without appropriate validation, certification, and authorization.

---

## License

This project is currently provided for demonstration and evaluation purposes.

License terms may be added as the project is prepared for public release.
