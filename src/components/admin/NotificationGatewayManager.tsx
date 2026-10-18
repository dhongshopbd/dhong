import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import { fetchGatewayStatus, sendTestEmailGateway, saveGatewayConfig } from '../../utils/notifications';

export const NotificationGatewayManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gatewayData, setGatewayData] = useState<any>(null);

  // Form State
  const [smtpUser, setSmtpUser] = useState('dhong.shop.bd@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromName, setFromName] = useState('Dhong Bangladesh (ঢং)');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Test Email State
  const [testEmailTarget, setTestEmailTarget] = useState('dhong.shop.bd@gmail.com');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadStatus = async () => {
    setLoading(true);
    const data = await fetchGatewayStatus();
    if (data) {
      setGatewayData(data);
      if (data.smtpUser) setSmtpUser(data.smtpUser);
      if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving settings to server...');
    const res = await saveGatewayConfig({
      smtpUser: smtpUser.trim(),
      smtpPass: smtpPass.trim(),
      fromEmail: smtpUser.trim(),
      fromName: fromName.trim(),
      webhookUrl: webhookUrl.trim(),
    });

    if (res.success) {
      setSaveStatus('Settings successfully saved and live on server!');
      loadStatus();
    } else {
      setSaveStatus(`Failed to save: ${res.error || 'Server error'}`);
    }
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTarget.trim()) return;
    setTestSending(true);
    setTestResult(null);
    const res = await sendTestEmailGateway(testEmailTarget.trim());
    setTestResult(res);
    setTestSending(false);
    loadStatus();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-brand text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-500" />
            Automated WhatsApp & Email Gateway
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time delivery management for customer Order Numbers, Tax Invoices, and WhatsApp notifications.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email Engine */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-200">Email Engine</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                gatewayData?.configured
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {gatewayData?.configured ? 'Gmail SMTP Active' : 'Active (Ethereal Fallback)'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sends rich HTML Order Numbers and Tax Invoices automatically to customers upon checkout and order confirmation.
          </p>
          <div className="text-[11px] font-mono text-neutral-300 pt-1 border-t border-neutral-800">
            From: {gatewayData?.fromEmail || 'dhong.shop.bd@gmail.com'}
          </div>
        </div>

        {/* WhatsApp Dispatch */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-200">WhatsApp Dispatch</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              1-Click Direct + Webhook
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Customer and Admin receive formatted Bangladesh WhatsApp messages (+880) with pre-filled Order Number and Invoice breakdown.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-1 border-t border-neutral-800">
            Format: BD 880XXXXXXXXX
          </div>
        </div>

        {/* Total Deliveries */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-200">Gateway Activity</span>
            </div>
            <span className="font-mono text-xs text-neutral-400">Port 3000</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All dispatches are recorded in memory and persistent database.
          </p>
          <div className="text-[11px] font-bold text-neutral-200 pt-1 border-t border-neutral-800">
            Total Dispatches Logged: {gatewayData?.totalLogs || 0}
          </div>
        </div>
      </div>

      {/* Configuration & Testing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Gmail SMTP Gateway Configuration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Shield className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
              Gmail / SMTP Credentials
            </h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            To send actual emails from <strong>dhong.shop.bd@gmail.com</strong> directly to real customer inboxes, generate a Google <strong>App Password</strong> (Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords) and paste it below.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Store Gmail / Sender Address
              </label>
              <input
                type="email"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="dhong.shop.bd@gmail.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Gmail App Password (16 characters)
              </label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="e.g. abcd efgh ijkl mnop"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Leave empty to use automated testing delivery (Ethereal test accounts with live preview links).
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Dhong Bangladesh (ঢং)"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Optional WhatsApp / Webhook Endpoint
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.eu1.make.com/... or Zapier Webhook"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
              />
            </div>

            {saveStatus && (
              <div className="p-2.5 rounded-xl bg-neutral-800 text-xs text-neutral-200 font-medium">
                {saveStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-red-600/20"
            >
              Save Gateway Configuration
            </button>
          </form>
        </div>

        {/* 2. Live Test Dispatcher */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
              Send Live Test Dispatch
            </h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Test sending an immediate test email to verify communication between your server and destination inboxes.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={testEmailTarget}
                onChange={(e) => setTestEmailTarget(e.target.value)}
                placeholder="dhong.shop.bd@gmail.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="button"
              disabled={testSending}
              onClick={handleSendTestEmail}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testSending ? 'Sending Live Test...' : 'Send Test Email Now'}</span>
            </button>

            {testResult && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {testResult.success ? 'Dispatch Success!' : 'Dispatch Failed'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ID: {testResult.messageId?.slice(0, 15) || 'n/a'}
                  </span>
                </div>
                {testResult.previewUrl && (
                  <div className="pt-2 border-t border-neutral-800">
                    <a
                      href={testResult.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold text-xs"
                    >
                      <span>View Generated Test Email in Browser &rarr;</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Dispatch History Log */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          Recent Notification Dispatch Logs
        </h3>

        {(!gatewayData?.recentLogs || gatewayData.recentLogs.length === 0) ? (
          <p className="text-xs text-neutral-500 italic py-4 text-center">
            No dispatches logged yet. Place an order or confirm an order to see live logs here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Recipient</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {gatewayData.recentLogs.map((log: any) => (
                  <tr key={log.id} className="text-neutral-300 hover:bg-neutral-950/50">
                    <td className="py-2 px-3 font-mono text-[11px] text-neutral-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 font-semibold text-neutral-200 uppercase text-[10px]">
                      {log.type.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-red-400">
                      {log.recipient}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'sent'
                            ? 'bg-emerald-950 text-emerald-300'
                            : log.status === 'preview_generated'
                            ? 'bg-blue-950 text-blue-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {log.previewUrl && (
                        <a
                          href={log.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
