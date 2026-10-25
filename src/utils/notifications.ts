// Automated Notification Service for Dhong Bangladesh (ঢং)
// Handles WhatsApp & Gmail dispatch for Order Numbers and Invoice Numbers

import { CustomerOrder, Invoice } from '../types';
import { formatBDT } from './currency';

/**
 * Normalizes a Bangladeshi phone number for international WhatsApp format.
 * Examples:
 *   "01790141399" -> "8801790141399"
 *   "+880 1790-141399" -> "8801790141399"
 *   "8801790141399" -> "8801790141399"
 */
export function formatBDPhoneForWhatsApp(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('880')) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith('0')) {
    return `88${digitsOnly}`;
  }
  if (digitsOnly.length === 10 && digitsOnly.startsWith('1')) {
    return `880${digitsOnly}`;
  }
  return digitsOnly ? `88${digitsOnly}` : '';
}

/**
 * Builds the message text for sending ORDER NUMBER (Step 1: On Placement)
 */
export function buildOrderNumberMessage(order: CustomerOrder): string {
  const itemNames = order.items.map((i) => `${i.name} (Size: ${i.size}, Qty: ${i.quantity})`).join(', ');
  
  return (
`🌸 *DHONG BANGLADESH (ঢং) — ORDER CONFIRMATION* 🌸
"Come meet the new you"

Salam ${order.customerName}! Thank you for shopping with Dhong Bangladesh.

📦 *YOUR ORDER NUMBER: ${order.id}*
📅 Date: ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
👗 Dresses (${order.items.length}): ${itemNames}
💵 Total Amount: ${formatBDT(order.total)} (${order.paymentMethod})
📍 Delivery Address: ${order.address}, ${order.city}

⏳ *Status:* Received (Pending Admin Confirmation)
ℹ️ *Note:* Our Dhaka dispatch team will verify your dress measurements and confirm your order shortly. Once confirmed, you will automatically receive your *Official Invoice Number*!

Helpline: 01790141399 (WhatsApp: 8801790141399)`
  );
}

/**
 * Builds the message text for sending INVOICE NUMBER (Step 2: After Order Confirmation)
 */
export function buildInvoiceNumberMessage(invoice: Invoice): string {
  const itemSummary = invoice.items
    .map((i) => `• ${i.name} [Size: ${i.size}, Qty: ${i.quantity}] - ${formatBDT(i.price * i.quantity)}`)
    .join('\n');

  return (
`✨ *DHONG BANGLADESH (ঢং) — OFFICIAL INVOICE* ✨
"Come meet the new you"

Salam ${invoice.customerName}! Your order has been *OFFICIALLY CONFIRMED*!

🧾 *INVOICE NUMBER: ${invoice.id}*
📦 *Order Reference: ${invoice.orderId}*
📅 Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}

*ORDER BREAKDOWN:*
${itemSummary}
Subtotal: ${formatBDT(invoice.subtotal)}
Nationwide Delivery: ${invoice.shipping === 0 ? 'FREE' : formatBDT(invoice.shipping)}
*Grand Total Payable: ${formatBDT(invoice.total)}*
Payment: ${invoice.paymentMethod}
${invoice.courier ? `Courier: ${invoice.courier}${invoice.trackingCode ? ` (Tracking: ${invoice.trackingCode})` : ''}` : ''}

📍 *Delivering To:* ${invoice.address}, ${invoice.city}

Your designer wear is now being packed with utmost care for swift dispatch. Keep this Invoice Number for order tracking.

Asiatic Shopping Complex, Konapara, Al-Amin Road, Demra, Dhaka-1362 • Hotline: 01790141399`
  );
}

/**
 * Generates direct WhatsApp click-to-chat URL
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatBDPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates direct Gmail compose Web link (opens Gmail in browser/tab)
 */
export function getGmailComposeUrl(email: string, subject: string, body: string): string {
  const targetEmail = email.trim();
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generates standard mailto URL
 */
export function getMailtoUrl(email: string, subject: string, body: string): string {
  const targetEmail = email.trim();
  return `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Dispatches Order Number notification to customer
 */
export function triggerOrderNumberNotification(order: CustomerOrder) {
  const text = buildOrderNumberMessage(order);
  const waUrl = getWhatsAppUrl(order.phone, text);
  
  const subject = `Order Placed: ${order.id} - Dhong Bangladesh (Come meet the new you)`;
  const gmailUrl = order.email ? getGmailComposeUrl(order.email, subject, text) : '';
  const mailtoUrl = order.email ? getMailtoUrl(order.email, subject, text) : '';

  return {
    orderId: order.id,
    whatsappUrl: waUrl,
    gmailUrl,
    mailtoUrl,
    text,
    subject,
  };
}

/**
 * Sends Order Number email via backend server
 */
export async function sendOrderEmailToServer(order: CustomerOrder): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const res = await fetch('/api/notifications/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Server error' };
    }
    const data = await res.json();
    return { success: true, previewUrl: data.previewUrl };
  } catch (err: any) {
    console.warn('Backend order email dispatch error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches Invoice Number notification to customer
 */
export function triggerInvoiceNumberNotification(invoice: Invoice) {
  const text = buildInvoiceNumberMessage(invoice);
  const waUrl = getWhatsAppUrl(invoice.phone, text);

  const subject = `Official Invoice ${invoice.id} (Order ${invoice.orderId}) - Dhong Bangladesh`;
  const gmailUrl = invoice.email ? getGmailComposeUrl(invoice.email, subject, text) : '';
  const mailtoUrl = invoice.email ? getMailtoUrl(invoice.email, subject, text) : '';

  return {
    invoiceId: invoice.id,
    orderId: invoice.orderId,
    whatsappUrl: waUrl,
    gmailUrl,
    mailtoUrl,
    text,
    subject,
  };
}

/**
 * Sends Invoice Number email via backend server
 */
export async function sendInvoiceEmailToServer(invoice: Invoice, order?: CustomerOrder): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const res = await fetch('/api/notifications/send-invoice-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice, order }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Server error' };
    }
    const data = await res.json();
    return { success: true, previewUrl: data.previewUrl };
  } catch (err: any) {
    console.warn('Backend invoice email dispatch error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch Gateway Status from Server
 */
export async function fetchGatewayStatus() {
  try {
    const res = await fetch('/api/notifications/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Send Test Email from Gateway
 */
export async function sendTestEmailGateway(targetEmail: string) {
  try {
    const res = await fetch('/api/notifications/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEmail }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save Gateway Configuration to Server
 */
export async function saveGatewayConfig(payload: any) {
  try {
    const res = await fetch('/api/notifications/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
