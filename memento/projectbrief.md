# Project Brief: eColane DRT Platform Test Automation

## Project Overview
Playwright-based end-to-end test automation suite for the eColane DRT (Demand Response Transit) Platform.

## Target Application
- **URL**: https://qa-react.ecolane.com/drt/
- **Environment**: QA (React-based frontend)
- **Credentials**: eco_eraju1 / Ecolane#drt123
- **Role**: Admin / Scheduler / Planner

## Core Requirements (5 Scenarios)

### Scenario 1: Login Functionality
- Validate successful login with Admin/Scheduler/Planner credentials
- Validate error handling for invalid credentials
- Validate session establishment

### Scenario 2: Create Trips
- Navigate: Administration → Clients → Client #21879 → Search → New Trip
- Fill all mandatory trip fields (pickup, dropoff, date, time, purpose, spaces, funding, service)
- Create future-dated trips

### Scenario 3: Create New Client
- Navigate: Administration → Clients → New Client
- Fill all mandatory client fields (name, DOB, phone, address, gender, etc.)
- Validate required field enforcement

### Scenario 4: Batch Optimization
- Navigate: Operations → Schedules → Optimize Schedules
- Click Search to load schedules
- Click Mark for Review in Schedule, Mark Complete, and Manual Dispatch sections

### Scenario 5: Send Messages
- Navigate: Operations → Messages → Send Messages
- Send messages to Drivers and Providers
- Fill recipient, message type, subject, and body fields

## Success Criteria
- All 5 scenarios have executable Playwright test cases
- Tests run in headed browser (Chromium)
- Screenshots captured at key steps
- HTML report generated after test run
