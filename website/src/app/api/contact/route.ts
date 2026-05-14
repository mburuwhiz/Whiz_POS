import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Configure Nodemailer for Brevo SMTP
    // Note: In production, these should be environment variables.
    // For this implementation, they are expected to be set in the environment where Next.js runs.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Brevo SMTP Login
        pass: process.env.SMTP_PASS, // Brevo SMTP Password (Master password)
      },
    });

    const escapeHTML = (str: string) => str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );

    const safeName = escapeHTML(name);
    const safeEmail = escapeHTML(email);
    const safeCompany = escapeHTML(company || '');
    const safeMessage = escapeHTML(message);

    const mailOptions = {
      from: `"Website Contact Form" <no-reply@pos.whizpoint.app>`,
      to: 'sales@pos.whizpoint.app',
      replyTo: safeEmail,
      subject: `New Lead: ${safeName} from ${safeCompany || 'Unknown Company'}`,
      text: `
        Name: ${safeName}
        Email: ${safeEmail}
        Company: ${safeCompany || 'Not provided'}

        Message:
        ${safeMessage}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Company:</strong> ${safeCompany || 'Not provided'}</p>
        <br/>
        <h3>Message:</h3>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
      `,
    };

    // If SMTP credentials aren't provided (e.g. in development without env vars),
    // we'll simulate a successful send for demonstration purposes, but log a warning.
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not provided. Simulating successful email send.");
        return NextResponse.json({ message: 'Email sent successfully (simulated)' }, { status: 200 });
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
