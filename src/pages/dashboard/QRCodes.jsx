import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Printer, Download, CheckCircle, XCircle, Loader2, QrCode, ScanLine } from 'lucide-react';

export default function QRCodes() {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  // Use env var for production URL, fallback to current origin for local dev
  const BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;

  useEffect(() => {
    fetchQRCodes();
  }, [user]);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      if (!user) {
        setErrorMessage('سجل دخولك الأول لو سمحت');
        return;
      }

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      console.log('Business found:', business);

      if (businessError) {
        console.error('Error fetching business:', businessError);
        throw new Error('ملقناش نشاط متسجل للحساب ده.');
      }

      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      console.log('QR Codes found:', qrData);

      if (qrError) {
        console.error('Error fetching qr codes:', qrError);
        throw qrError;
      }

      setQrCodes(qrData || []);

    } catch (err) {
      console.error('Error in fetchQRCodes:', err);
      setErrorMessage(err.message || 'حصلت مشكلة وإحنا بنجيب الـ QR Codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setErrorMessage('');
    setGenerating(true);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, plan, subscription_status')
        .eq('owner_id', currentUser.id)
        .single();

      console.log('business:', businessData);
      console.log('business.plan:', businessData?.plan);
      console.log('existing qr count:', qrCodes.length);

      if (businessError || !businessData) {
        setErrorMessage('ملقناش نشاط تجاري.');
        return;
      }

      // Check limits based on SaaS pricing (uses real column: plan)
      const plan = businessData.plan || 'starter';
      const limit = plan === 'growth' ? 5 : 1; // Starter = 1, Growth = 5

      if (qrCodes.length >= limit) {
        setErrorMessage(`الباقة بتاعتك (${plan}) بتسمح بـ ${limit} QR Code بس. رقي باقتك عشان تضيف تاني.`);
        return;
      }

      // Generate new unique code
      const uniqueCode = crypto.randomUUID();

      const { data: newQR, error: insertError } = await supabase
        .from('qr_codes')
        .insert([
          {
            business_id: businessData.id,
            code: uniqueCode,
            is_active: true
          }
        ])
        .select()
        .single();

      if (insertError) {
        setErrorMessage(insertError.message || 'حصلت مشكلة وإحنا بنضيف الـ QR Code.');
        return;
      }

      setQrCodes((prev) => [newQR, ...prev]);

    } catch (err) {
      console.error('Error generating QR:', err);
      setErrorMessage(err.message || 'حصلت مشكلة غير متوقعة.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = (qrCode) => {
    const svg = document.querySelector(`#qr-${qrCode.code} svg`);
    if (!svg) {
      alert('مش لاقيين شكل الـ QR عشان نحمله.');
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = `QR-${qrCode.code}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(data);
  };

  const printQR = (qrCode) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('اسمح بالـ Pop-ups الأول عشان نعرف نطبع');
      return;
    }

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة QR Code</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              padding: 20px;
            }
            .container {
              border: 2px dashed #4f46e5;
              padding: 40px;
              border-radius: 24px;
              max-width: 400px;
            }
            h1 { color: #111827; margin-bottom: 24px; font-size: 28px; }
            .qr-wrapper { margin-bottom: 24px; }
            p { color: #4b5563; font-size: 18px; line-height: 1.5; font-weight: bold; }
            @media print {
              .container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>انضم لبرنامج الولاء بتاعنا!</h1>
            <div class="qr-wrapper">
              ${document.querySelector(`#qr-${qrCode.code} svg`)?.outerHTML || ''}
            </div>
            <p>امسح الكود بكاميرا موبايلك<br/>وبدل نقطك بعد كل زيارة بمكافآت مميزة</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary-600" />
            إدارة رموز QR
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            اعمل وتابع الـ QR Codes لبرنامج الولاء بتاعك.
          </p>
        </div>

        <button
          onClick={handleGenerateQR}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>إضافة QR Code جديد</span>
        </button>
      </div>

      {/* Error banner - always a stable block, never conditional on qrCodes */}
      {errorMessage !== '' && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Empty state */}
      {qrCodes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">مفيش QR Codes لسه</h3>
          <p className="text-gray-500">اعمل أول QR Code لنشاطك دلوقتي وخلّي العملاء يجمعوا نقط.</p>
        </div>
      )}

      {/* QR Cards grid */}
      {qrCodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition hover:shadow-md">
              <div
                id={`qr-${qr.code}`}
                className="p-8 flex justify-center items-center bg-gray-50 relative"
              >
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <QRCodeSVG
                    value={`${BASE_URL}/customer/register?qr=${qr.code}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg" dir="ltr">{qr.code}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      اتعمل يوم: {new Date(qr.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  {qr.is_active ? (
                    <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      شغال
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                      <XCircle className="w-3 h-3 ml-1" />
                      مقفول
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-primary-50 rounded-lg px-3 py-2 flex items-center">
                    <ScanLine className="w-4 h-4 text-primary-600 ml-2" />
                    <span className="text-sm font-bold text-primary-900">{qr.scans_count || 0}</span>
                    <span className="text-xs text-primary-700 mr-1">مرة مسح</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => printQR(qr)}
                    className="flex justify-center items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    <Printer className="w-4 h-4 ml-2 text-gray-400" />
                    طباعة
                  </button>
                  <button
                    onClick={() => downloadQR(qr)}
                    className="flex justify-center items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
