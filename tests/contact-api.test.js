import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/contact.js';

async function submit({ method = 'POST', origin = 'https://portfolio.example', body } = {}) {
  const headers = {};
  const response = {
    statusCode: 200,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    end(value) {
      this.body = JSON.parse(value);
    },
  };
  const request = {
    method,
    headers: {
      origin,
      host: 'portfolio.example',
      'content-type': 'application/json',
    },
    body,
  };

  await handler(request, response);
  return { status: response.statusCode, headers, body: response.body };
}

const validMessage = {
  name: 'Portfolio visitor',
  email: 'visitor@example.com',
  subject: 'A project opportunity',
  message: 'I would like to discuss a backend project.',
};

test('rejects unsupported methods and cross-origin requests', async () => {
  const methodResponse = await submit({ method: 'GET' });
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.allow, 'POST');

  const originResponse = await submit({ origin: 'https://another-site.example', body: validMessage });
  assert.equal(originResponse.status, 403);
});

test('rejects honeypot and invalid contact data', async () => {
  const spamResponse = await submit({ body: { ...validMessage, website: 'bot-filled-field' } });
  assert.equal(spamResponse.status, 400);

  const invalidEmailResponse = await submit({ body: { ...validMessage, email: 'not-an-email' } });
  assert.equal(invalidEmailResponse.status, 400);
});

test('never reports a message as sent when Gmail SMTP is not configured', async (context) => {
  const previousUser = process.env.GMAIL_USER;
  const previousPassword = process.env.GMAIL_APP_PASSWORD;
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
  context.after(() => {
    if (previousUser === undefined) delete process.env.GMAIL_USER;
    else process.env.GMAIL_USER = previousUser;
    if (previousPassword === undefined) delete process.env.GMAIL_APP_PASSWORD;
    else process.env.GMAIL_APP_PASSWORD = previousPassword;
  });

  const response = await submit({ body: validMessage });
  assert.equal(response.status, 503);
  assert.equal(response.body.sent, false);
});
