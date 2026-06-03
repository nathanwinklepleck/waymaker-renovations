export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, service, message } = req.body || {};

  // Server-side validation
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const nameClean = `${String(firstName).trim()} ${String(lastName).trim()}`;
  const emailClean = String(email).trim();
  const phoneClean = String(phone).trim();
  const serviceClean = service ? String(service).trim() : 'Not specified';
  const messageClean = message ? String(message).trim().slice(0, 500) : 'No message provided';

  const smsBody = [
    'New contact from waymakerrenovations.com',
    `Name: ${nameClean}`,
    `Phone: ${phoneClean}`,
    `Email: ${emailClean}`,
    `Service: ${serviceClean}`,
    `Message: ${messageClean}`,
  ].join('\n');

  const textbeltKey = process.env.TEXTBELT_API || 'textbelt';

  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '4632239675',
        message: smsBody,
        key: textbeltKey,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Textbelt error:', result);
      // Still return success to the visitor — don't expose SMS errors
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('SMS send failed:', err);
    // Still return success to the visitor
    return res.status(200).json({ success: true });
  }
}
