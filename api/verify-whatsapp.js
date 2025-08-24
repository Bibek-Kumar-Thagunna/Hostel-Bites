export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { phoneNumber } = req.body || {};
    const digits = String(phoneNumber || '').replace(/\D/g, '');

    // basic 10-digit validation (India). Adjust as needed.
    const ten = digits.length === 10 ? digits : (digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : '');
    if (!/^([6-9][0-9]{9})$/.test(ten)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian number.' });
    }

    // Simulated check via wa.me. This does NOT guarantee WA registration; used as a best-effort heuristic.
    const url = `https://wa.me/91${ten}`;
    try {
      const resp = await fetch(url, { method: 'HEAD' });
      if (resp.ok) {
        return res.status(200).json({ success: true, normalized: ten, message: 'Number verified.' });
      }
      return res.status(200).json({ success: false, normalized: ten, message: 'Could not verify number.' });
    } catch (_e) {
      return res.status(200).json({ success: false, normalized: ten, message: 'Could not verify number.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
}


