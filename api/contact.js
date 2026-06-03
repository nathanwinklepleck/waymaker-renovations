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

  const textbeltKey = process.env.TEXTBELT_API;
  const destinationPhone = process.env.TEXTBELT_TO || '+14632239675';

  if (!textbeltKey) {
    console.error('Missing TEXTBELT_API environment variable');
    return res.status(500).json({
      success: false,
      error: 'Messaging is temporarily unavailable. Please call us directly.',
    });
  }

  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: destinationPhone,
        message: smsBody,
        key: textbeltKey,
      }),
    });

    if (!response.ok) {
      console.error('Textbelt HTTP error:', response.status, response.statusText);
      return res.status(502).json({
        success: false,
        error: 'Unable to send your request right now. Please try again or call us.',
      });
    }

    const result = await response.json();

    if (!result.success) {
      console.error('Textbelt error:', result);
      return res.status(502).json({
        success: false,
        error: 'Unable to send your request right now. Please try again or call us.',
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('SMS send failed:', err);
    return res.status(502).json({
      success: false,
      error: 'Unable to send your request right now. Please try again or call us.',
    });
  }
}
