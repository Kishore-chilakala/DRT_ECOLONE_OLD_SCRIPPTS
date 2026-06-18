/**
 * Test Data Configuration for eColane DRT Platform
 */

const TEST_CONFIG = {
baseURL: 'https://qa-react.ecolane.com/drt/',

  // Credentials
  credentials: {
    username: 'eco_eraju1',
    password: 'Ecolane#drt123',
    role: 'Admin',
  },

  // Client Data
  client: {
    clientNumber: '21879',
    existingClientId: '21879',
  },

  // Trip Data - Scenario 2
  trip: {
    pickupAddress: '123 Main Street, Philadelphia, PA 19103',
    dropoffAddress: '456 Elm Street, Philadelphia, PA 19104',
    tripDate: '07/15/2026',
    tripTime: '10:00 AM',
    appointmentTime: '10:30 AM',
    tripPurpose: 'Medical',
    spaces: '1',
    fundingSource: 'Default',
    serviceType: 'Demand Response',
  },

  // New Client Data - Scenario 3
newClient: {
    firstName: 'John',
    lastName: 'AutoTest',
    dateOfBirth: '01/15/1980',
    phone: '2155551234',
    address: '789 Oak Avenue',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19105',
 county: 'Philadelphia',
    gender: 'Male',
    email: 'johnautotest@example.com',
  },

  // Batch Optimization Data - Scenario 4
  optimization: {
    date: '07/15/2026',
 provider: 'Default Provider',
    service: 'Demand Response',
  },

  // Message Data - Scenario 5
  message: {
    recipient: 'Driver',
    subject: 'Test Message from Automation',
    body: 'This is an automated test message sent via Playwright automation. Please ignore.',
    messageType: 'General',
  },

  // Timeouts
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    navigation: 60000,
  },
};

module.exports = { TEST_CONFIG };
