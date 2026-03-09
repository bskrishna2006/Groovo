const nodemailer = require('nodemailer');

// Create transporter — uses Gmail SMTP by default
// Set SMTP_USER and SMTP_PASS in .env to enable
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // Email disabled if not configured
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Skipped] No SMTP configured. Would send to: ${to}, Subject: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Groovo Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[Email Error] ${err.message}`);
    return false;
  }
};

// Pre-built email templates
const sendMentorshipAccepted = async (entrepreneurEmail, mentorName) => {
  return sendEmail(
    entrepreneurEmail,
    '🎉 Mentorship Request Accepted — Groovo',
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0;">Great News! 🎉</h1>
      </div>
      <p style="font-size: 16px; color: #333;">Your mentorship request has been <strong style="color: #22c55e;">accepted</strong> by <strong>${mentorName}</strong>!</p>
      <p style="color: #666;">Log in to Groovo to start your mentoring journey. You can now message your mentor directly through the platform.</p>
      <a href="http://localhost:8080/entrepreneur" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">Go to Dashboard</a>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">— Groovo Platform</p>
    </div>`
  );
};

const sendFundingAccepted = async (entrepreneurEmail, investorNotes) => {
  return sendEmail(
    entrepreneurEmail,
    '💰 Funding Proposal Accepted — Groovo',
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0;">Funding Approved! 💰</h1>
      </div>
      <p style="font-size: 16px; color: #333;">An investor has <strong style="color: #22c55e;">accepted</strong> your funding proposal!</p>
      ${investorNotes ? `<p style="color: #666;"><strong>Investor Notes:</strong> ${investorNotes}</p>` : ''}
      <p style="color: #666;">Log in to see the details and connect with your investor.</p>
      <a href="http://localhost:8080/entrepreneur" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">View Details</a>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">— Groovo Platform</p>
    </div>`
  );
};

const sendPatentStatusUpdate = async (entrepreneurEmail, status, title) => {
  const isApproved = status === 'approved';
  return sendEmail(
    entrepreneurEmail,
    `📋 Patent ${isApproved ? 'Approved' : 'Update'} — Groovo`,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0;">Patent Update 📋</h1>
      </div>
      <p style="font-size: 16px; color: #333;">Your patent "<strong>${title}</strong>" status has been updated to <strong style="color: ${isApproved ? '#22c55e' : '#6366f1'};">${status}</strong>.</p>
      <a href="http://localhost:8080/entrepreneur" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">View Details</a>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">— Groovo Platform</p>
    </div>`
  );
};

module.exports = {
  sendEmail,
  sendMentorshipAccepted,
  sendFundingAccepted,
  sendPatentStatusUpdate,
};
