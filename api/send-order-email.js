// File: /api/send-order-email.js
import { Resend } from 'resend';

// IMPORTANT: Store your API key in Vercel Environment Variables, NOT here.
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderDetails, toEmail } = req.body;

    // Create a simple HTML body for the email
    const emailHtml = `
      <h1>New Order Received!</h1>
      <p><strong>From:</strong> ${orderDetails.userName}</p>
      <p><strong>Order Type:</strong> ${orderDetails.orderType}</p>
      <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
      ${orderDetails.upiTransactionId !== 'N/A' ? `<p><strong>UPI ID:</strong> ${orderDetails.upiTransactionId}</p>` : ''}
      <hr />
      <h3>Order Summary:</h3>
      <ul>
        ${orderDetails.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('')}
      </ul>
    `;

    await resend.emails.send({
      from: 'Hostel Bites <onboarding@resend.dev>', // This "from" address is required by Resend's free tier
      to: toEmail,
      subject: `New Order from ${orderDetails.userName}`,
      html: emailHtml,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Error sending email', error });
  }
}
