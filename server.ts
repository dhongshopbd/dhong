import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory runtime notification configuration & logs
interface NotificationConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  webhookUrl: string;
}

interface DispatchLog {
  id: string;
  timestamp: string;
  type: 'order_number' | 'invoice_number' | 'test';
  channel: 'email' | 'whatsapp' | 'webhook';
  recipient: string;
  status: 'sent' | 'preview_generated' | 'failed';
  details: string;
  previewUrl?: string;
}

const config: NotificationConfig = {
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 465,
  smtpSecure: process.env.SMTP_SECURE !== 'false',
  smtpUser: process.env.SMTP_USER || 'dhong.shop.bd@gmail.com',
  smtpPass: process.env.SMTP_PASS || '',
  fromEmail: process.env.FROM_EMAIL || 'dhong.shop.bd@gmail.com',
  fromName: process.env.FROM_NAME || 'Dhong Bangladesh (ঢং)',
  webhookUrl: process.env.WEBHOOK_URL || '',
};

const dispatchLogs: DispatchLog[] = [];

function addLog(log: Omit<DispatchLog, 'id' | 'timestamp'>) {
  const entry: DispatchLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  dispatchLogs.unshift(entry);
  if (dispatchLogs.length > 100) dispatchLogs.pop();
  return entry;
}

// Create Nodemailer Transporter
async function getTransporter() {
  if (config.smtpUser && config.smtpPass) {
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Fallback to auto-generated test Ethereal transporter if no credentials set yet
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('Could not create test SMTP account:', err);
    return null;
  }
}

// 1. Get Notification Gateway Status
app.get('/api/notifications/status', (req: Request, res: Response) => {
  res.json({
    configured: Boolean(config.smtpUser && config.smtpPass),
    smtpUser: config.smtpUser,
    fromEmail: config.fromEmail,
    webhookUrl: config.webhookUrl,
    totalLogs: dispatchLogs.length,
    recentLogs: dispatchLogs.slice(0, 10),
  });
});

// 2. Update Notification Gateway Settings
app.post('/api/notifications/config', (req: Request, res: Response) => {
  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, fromEmail, fromName, webhookUrl } = req.body;
  if (smtpHost !== undefined) config.smtpHost = smtpHost;
  if (smtpPort !== undefined) config.smtpPort = Number(smtpPort);
  if (smtpSecure !== undefined) config.smtpSecure = Boolean(smtpSecure);
  if (smtpUser !== undefined) config.smtpUser = smtpUser;
  if (smtpPass !== undefined) config.smtpPass = smtpPass;
  if (fromEmail !== undefined) config.fromEmail = fromEmail;
  if (fromName !== undefined) config.fromName = fromName;
  if (webhookUrl !== undefined) config.webhookUrl = webhookUrl;

  res.json({
    success: true,
    message: 'Notification gateway settings updated successfully',
    configured: Boolean(config.smtpUser && config.smtpPass),
  });
});

// 3. Send Order Number Email (Step 1: Placed)
app.post('/api/notifications/send-order-email', async (req: Request, res: Response) => {
  try {
    const { order } = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, error: 'Invalid order data' });
    }

    const recipient = order.email?.trim() || config.fromEmail;
    const transporter = await getTransporter();

    const itemsHtml = (order.items || [])
      .map(
        (it: any) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <strong>${it.name}</strong><br/>
              <span style="font-size: 12px; color: #666;">Size: ${it.size} | Qty: ${it.quantity}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #b91c1c;">
              ৳${(it.price * it.quantity).toLocaleString('en-IN')}
            </td>
          </tr>`
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: #111827; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">DHONG BANGLADESH</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #f87171; letter-spacing: 1px;">"Come meet the new you"</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Order Received: #${order.id}</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
            Salam <strong>${order.customerName}</strong>,<br/>
            Thank you for shopping with Dhong Bangladesh! Your order has been registered in our system and is currently being processed by our Dhaka couture team.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Order ID:</strong> <span style="color: #dc2626; font-family: monospace; font-size: 15px;">${order.id}</span></p>
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Phone / WhatsApp:</strong> ${order.phone}</p>
            <p style="margin: 0 0 8px; font-size: 13px;"><strong>Delivery Address:</strong> ${order.address}, ${order.city}</p>
            <p style="margin: 0; font-size: 13px;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6; text-align: left; font-size: 12px; color: #4b5563;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 12px 10px; font-weight: bold; font-size: 14px;">Total Payable:</td>
                <td style="padding: 12px 10px; font-weight: bold; font-size: 16px; color: #b91c1c; text-align: right;">৳${(order.total || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 4px; font-size: 12px; color: #065f46;">
            <strong>Next Step:</strong> As soon as our admin team confirms your order, your <strong>Official Tax Invoice Number</strong> will be sent automatically to your WhatsApp and Email!
          </div>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          Dhaka, Bangladesh • Helpline: +880 1711-223344<br/>
          Dhong Bangladesh — Come meet the new you.
        </div>
      </div>
    `;

    let info: any = null;
    let previewUrl: string | undefined;

    if (transporter) {
      info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: recipient,
        subject: `Order Confirmation #${order.id} — Dhong Bangladesh`,
        html,
      });

      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    }

    addLog({
      type: 'order_number',
      channel: 'email',
      recipient,
      status: info ? (previewUrl ? 'preview_generated' : 'sent') : 'failed',
      details: `Order #${order.id} notification prepared for ${order.customerName}`,
      previewUrl,
    });

    // Also forward to Webhook if configured
    if (config.webhookUrl) {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'order_created', order }),
      }).catch((e) => console.warn('Webhook dispatch error:', e));
    }

    res.json({
      success: true,
      deliveredTo: recipient,
      messageId: info?.messageId,
      previewUrl,
    });
  } catch (error: any) {
    console.error('Send order email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Send Invoice Number Email (Step 2: Admin Confirmation)
app.post('/api/notifications/send-invoice-email', async (req: Request, res: Response) => {
  try {
    const { invoice, order } = req.body;
    if (!invoice || !invoice.id) {
      return res.status(400).json({ success: false, error: 'Invalid invoice data' });
    }

    const recipient = invoice.email?.trim() || order?.email?.trim() || config.fromEmail;
    const transporter = await getTransporter();

    const itemsHtml = (invoice.items || [])
      .map(
        (it: any) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <strong>${it.name}</strong><br/>
              <span style="font-size: 12px; color: #666;">Size: ${it.size} | Qty: ${it.quantity}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #b91c1c;">
              ৳${(it.price * it.quantity).toLocaleString('en-IN')}
            </td>
          </tr>`
      )
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: #991b1b; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">DHONG BANGLADESH</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #fecaca; letter-spacing: 1px;">OFFICIAL TAX INVOICE • "Come meet the new you"</p>
        </div>
        <div style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Invoice Number:</span>
              <div style="font-family: monospace; font-size: 20px; font-weight: bold; color: #b91c1c;">${invoice.id}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: #6b7280;">Order Ref:</span>
              <div style="font-family: monospace; font-size: 14px; color: #111827; font-weight: bold;">${invoice.orderId}</div>
            </div>
          </div>

          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
            Salam <strong>${invoice.customerName}</strong>,<br/>
            Your order has been <strong>officially confirmed</strong>! Below is your official tax invoice details.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 0 0 6px;"><strong>Customer Phone:</strong> ${invoice.phone}</p>
            <p style="margin: 0 0 6px;"><strong>Delivery Destination:</strong> ${invoice.address}, ${invoice.city}</p>
            <p style="margin: 0 0 6px;"><strong>Courier Partner:</strong> ${invoice.courier || 'Steadfast Courier'}</p>
            ${invoice.trackingCode ? `<p style="margin: 0 0 6px;"><strong>Tracking Code:</strong> <span style="font-family: monospace; color: #dc2626;">${invoice.trackingCode}</span></p>` : ''}
            <p style="margin: 0;"><strong>Payment Status:</strong> ${invoice.paymentMethod} (${invoice.status || 'Confirmed'})</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6; text-align: left; font-size: 12px; color: #4b5563;">
                <th style="padding: 10px;">Item & Size</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 8px 10px; color: #6b7280;">Subtotal:</td>
                <td style="padding: 8px 10px; text-align: right;">৳${(invoice.subtotal || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; color: #6b7280;">Delivery Charge:</td>
                <td style="padding: 8px 10px; text-align: right;">${invoice.shipping === 0 ? 'FREE' : `৳${(invoice.shipping || 0).toLocaleString('en-IN')}`}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 10px; font-weight: bold; font-size: 15px;">Grand Total:</td>
                <td style="padding: 12px 10px; font-weight: bold; font-size: 18px; color: #b91c1c; text-align: right;">৳${(invoice.total || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          Dhaka, Bangladesh • Hotline: +880 1711-223344<br/>
          Dhong Bangladesh — Come meet the new you.
        </div>
      </div>
    `;

    let info: any = null;
    let previewUrl: string | undefined;

    if (transporter) {
      info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: recipient,
        subject: `Official Invoice ${invoice.id} (Order ${invoice.orderId}) — Dhong Bangladesh`,
        html,
      });

      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    }

    addLog({
      type: 'invoice_number',
      channel: 'email',
      recipient,
      status: info ? (previewUrl ? 'preview_generated' : 'sent') : 'failed',
      details: `Official Invoice ${invoice.id} sent to ${recipient}`,
      previewUrl,
    });

    if (config.webhookUrl) {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'invoice_confirmed', invoice }),
      }).catch((e) => console.warn('Webhook dispatch error:', e));
    }

    res.json({
      success: true,
      deliveredTo: recipient,
      messageId: info?.messageId,
      previewUrl,
    });
  } catch (error: any) {
    console.error('Send invoice email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Test Email Dispatch
app.post('/api/notifications/test-email', async (req: Request, res: Response) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || config.fromEmail;
    const transporter = await getTransporter();

    if (!transporter) {
      return res.status(500).json({ success: false, error: 'Could not initialize email transporter' });
    }

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipient,
      subject: `Test Dispatch from Dhong Bangladesh Gateway`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #fafafa;">
          <h2 style="color: #dc2626;">Dhong Bangladesh (ঢং)</h2>
          <p>This is a live test email confirming your notification gateway is online and communicating properly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><em>"Come meet the new you"</em></p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    addLog({
      type: 'test',
      channel: 'email',
      recipient,
      status: previewUrl ? 'preview_generated' : 'sent',
      details: 'Test email successfully triggered from Admin Gateway',
      previewUrl,
    });

    res.json({
      success: true,
      deliveredTo: recipient,
      messageId: info.messageId,
      previewUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Vite or static server
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: 3000,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Dhong Couture Full-Stack Server active on port ${port}`);
  });
}

start().catch(console.error);
