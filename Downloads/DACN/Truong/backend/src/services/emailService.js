const { sendEmail } = require('../config/email');

const sendOTPEmail = async (email, otp, fullName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo h1 { color: #3b82f6; margin: 0; }
        h2 { color: #1e293b; margin-bottom: 16px; }
        p { color: #64748b; line-height: 1.6; }
        .otp-box { background: #f1f5f9; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; }
        .note { font-size: 14px; color: #94a3b8; }
        .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>Schedule App</h1>
        </div>
        <h2>Xin chao ${fullName},</h2>
        <p>Ban da yeu cau dat lai mat khau. Vui long su dung ma OTP duoi day:</p>
        <div class="otp-box">
          <div class="otp">${otp}</div>
        </div>
        <p class="note">Ma OTP co hieu luc trong 10 phut. Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.</p>
        <div class="footer">
          <p class="note">Schedule Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Ma xac nhan dat lai mat khau - Schedule App',
    html
  });
};

const sendWelcomeEmail = async (email, fullName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo h1 { color: #3b82f6; margin: 0; }
        h2 { color: #1e293b; margin-bottom: 16px; }
        p { color: #64748b; line-height: 1.6; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0; }
        .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .note { font-size: 14px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>Schedule App</h1>
        </div>
        <h2>Chao mung ${fullName}!</h2>
        <p>Cam on ban da dang ky tai khoan. Bay gio ban co the bat dau quan ly thoi gian cua minh mot cach hieu qua.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/login" class="btn">Dang nhap ngay</a>
        </p>
        <div class="footer">
          <p class="note">Schedule Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Chao mung den voi Schedule App!',
    html
  });
};

const sendEventReminder = async (email, fullName, event) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo h1 { color: #3b82f6; margin: 0; }
        h2 { color: #1e293b; margin-bottom: 16px; }
        p { color: #64748b; line-height: 1.6; }
        .event-card { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${event.color || '#3b82f6'}; }
        .event-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .event-time { color: #64748b; margin-bottom: 4px; }
        .event-location { color: #64748b; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
        .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .note { font-size: 14px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>Schedule App</h1>
        </div>
        <h2>Nhac lich!</h2>
        <p>Xin chao ${fullName}, ban co su kien sap dien ra:</p>
        <div class="event-card">
          <div class="event-title">${event.title}</div>
          <div class="event-time">Thoi gian: ${event.start_time}</div>
          ${event.location ? `<div class="event-location">Dia diem: ${event.location}</div>` : ''}
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/calendar" class="btn">Xem chi tiet</a>
        </p>
        <div class="footer">
          <p class="note">Schedule Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Nhac lich: ${event.title}`,
    html
  });
};

// General purpose email sender
const sendGeneralEmail = async (to, subject, html) => {
  await sendEmail({
    to,
    subject,
    html
  });
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendEventReminder,
  sendEmail: sendGeneralEmail
};
