
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const SUPPORT_ENDPOINT = process.env.VITE_SUPPORT_ENDPOINT || "https://ldewwmfkymjmokopulys.supabase.co";
    const SUPABASE_URL = `${SUPPORT_ENDPOINT.replace(/\/$/, '')}/functions/v1/submit-support`;
    const FORM_SECRET = process.env.FORM_SECRET;
    
    const { product, category, message, user_email, metadata } = req.body;

    // Validation
    if (!product || !category || !message || !user_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const payload = {
      product,
      category,
      message,
      user_email,
      metadata: metadata || {}
    };

    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "x-form-secret": FORM_SECRET,
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      return res.status(429).json({ error: "Too many submissions. Try again later." });
    }

    if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Support API Error:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
