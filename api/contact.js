import nodemailer from 'nodemailer';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECIPIENT = 'mseshareddy48@gmail.com';

function respond(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function readText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasSameOrigin(request) {
  const origin = request.headers.origin;
  const requestHost = String(request.headers['x-forwarded-host'] || request.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (!origin || !requestHost) return false;

  try {
    return new URL(origin).host.toLowerCase() === requestHost;
  } catch {
    return false;
  }
}

export default async function handler(request, response) {
  response.setHeader('Allow', 'POST');

  if (request.method !== 'POST') {
    return respond(response, 405, { sent: false, message: 'Use POST to send a message.' });
  }

  if (!hasSameOrigin(request)) {
    return respond(response, 403, { sent: false, message: 'This request could not be verified. Please refresh the page and try again.' });
  }

  if (!String(request.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return respond(response, 415, { sent: false, message: 'The contact form must submit JSON.' });
  }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return respond(response, 400, { sent: false, message: 'The contact form data is invalid.' });
  }

  if (readText(body.website)) {
    return respond(response, 400, { sent: false, message: 'This submission was rejected. Please leave the hidden field empty.' });
  }

  const name = readText(body.name);
  const email = readText(body.email);
  const subject = readText(body.subject).replace(/[\r\n]+/g, ' ');
  const message = readText(body.message);

  if (name.length < 2 || name.length > 100) {
    return respond(response, 400, { sent: false, message: 'Enter a name between 2 and 100 characters.' });
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return respond(response, 400, { sent: false, message: 'Enter a valid email address.' });
  }
  if (subject.length < 2 || subject.length > 150) {
    return respond(response, 400, { sent: false, message: 'Enter a subject between 2 and 150 characters.' });
  }
  if (message.length < 10 || message.length > 5000) {
    return respond(response, 400, { sent: false, message: 'Enter a message between 10 and 5,000 characters.' });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || RECIPIENT;

  if (!gmailUser || !appPassword) {
    return respond(response, 503, { sent: false, message: 'Email is not configured yet. Please contact Sesha directly at mseshareddy48@gmail.com.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: appPassword },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  try {
    await transporter.sendMail({
      from: { name: 'Sesha Reddy Portfolio', address: gmailUser },
      to: recipient,
      replyTo: { name: name.replace(/[\r\n]+/g, ' '), address: email },
      subject: `Portfolio contact: ${subject}`,
      text: [
        'New message from the portfolio contact form',
        '',
        `Name: ${name.replace(/[\r\n]+/g, ' ')}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        message,
      ].join('\n'),
    });
  } catch (error) {
    console.error('Gmail SMTP delivery failed:', error instanceof Error ? error.message : 'Unknown SMTP error');
    return respond(response, 502, { sent: false, message: 'Gmail could not deliver your message. Please try again or email Sesha directly.' });
  }

  return respond(response, 200, { sent: true, message: 'Your message was sent to Sesha. Thank you for reaching out.' });
}
