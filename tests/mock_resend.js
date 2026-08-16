// Mock Resend SDK for integration testing.
// Mirrors the real SDK: methods return { data, error, headers } and do NOT throw.

const sentEmails = [];
const contacts = [];
let contactCreateCount = 0;
let duplicateEmails = new Set();

class MockResend {
  constructor() {
    this.contacts = {
      async create({ audienceId, email }) {
        contactCreateCount++;
        // Simulate duplicate detection — Resend returns 422 for existing contacts
        if (duplicateEmails.has(email) || contacts.includes(email)) {
          return {
            data: null,
            error: {
              message: 'Contact already exists',
              statusCode: 422,
              name: 'validation_error',
            },
            headers: {},
          };
        }
        contacts.push(email);
        return {
          data: { id: 'contact_' + contactCreateCount, email, audienceId, object: 'contact' },
          error: null,
          headers: {},
        };
      },
    };
    this.emails = {
      async send({ from, to, subject, html, text, tags, headers }) {
        sentEmails.push({ from, to, subject, html, text, tags, headers });
        return {
          data: { id: 'email_' + sentEmails.length },
          error: null,
          headers: {},
        };
      },
    };
  }
}

MockResend._sentEmails = sentEmails;
MockResend._contacts = contacts;
MockResend._markDuplicate = (email) => { duplicateEmails.add(email); };
MockResend._reset = () => {
  sentEmails.length = 0;
  contacts.length = 0;
  contactCreateCount = 0;
  duplicateEmails = new Set();
};

export { MockResend as Resend };
