import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { Scan, Store, ShieldAlert } from 'lucide-react';

export default function QRScan() {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          supportedScanTypes: [0] // Camera
        },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
    }

    async function onScanSuccess(decodedText, decodedResult) {
      console.log(`Scan result: ${decodedText}`, decodedResult);
      if (scanner) {
        scanner.clear();
      }
      setIsScanning(false);
      setIsScanning(false);
      await processQRCode(decodedText);
    }

    function onScanFailure(err) {
      // Ignore routine scan failures
      console.debug("Scan failure:", err);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const processQRCode = async (qrData) => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Log the scanned QR code
      const qrString = qrData.trim();
      console.log('Step 1: Searching for QR code (Scan):', qrString);
      
      // 2. Look up the qr_codes table (separated from join to prevent errors)
      const { data: qrResults, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('code', qrString)
        .eq('is_active', true)
        .limit(1);
        
      console.log('Step 1 Result - QR data:', { qrResults, qrError });
        
      if (qrError) {
        console.error('QR Query error:', qrError);
        throw new Error(`حصلت مشكلة: ${qrError.message}`);
      }
      
      if (!qrResults || qrResults.length === 0) {
        throw new Error(`ملقناش QR شغال: ${qrString} (قد تحتاج إلى تفعيل RLS Policies)`);
      }
      
      const qrDoc = qrResults[0];
      const businessId = qrDoc.business_id;
      console.log('Step 2: Searching for Business ID:', businessId);

      // 3. Fetch business data
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .limit(1);

      console.log('Step 2 Result - Business data:', { bizData, bizError });
        
      if (bizError) {
        throw new Error(`حصلت مشكلة في التاكد من النشاط: ${bizError.message}`);
      }
      
      if (!bizData || bizData.length === 0) {
        throw new Error('ملقناش النشاط ده متاح.');
      }
      
      const business = bizData[0];
      
      if (business.subscription_status !== 'active') {
        setError('اشتراك النشاط ده خلص.');
        setLoading(false);
        return;
      }

      // 4. Since we don't know the user's phone yet,
      // we check local storage to see if they are already registered
      const customerId = localStorage.getItem(`loyalty_customer_${businessId}`);

      if (customerId) {
        // User already has an account for this business, redirect to profile
        navigate(`/customer/profile/${customerId}`);
      } else {
        // First time scanning this business on this device, pass QR string
        navigate(`/customer/register?qr=${qrString}`);
      }

    } catch (err) {
      console.error('Error processing QR:', err);
      setError(err.message || 'حصلت مشكلة واحنا بنقرا الـ QR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full grow p-6 items-center justify-center text-center">
      
      <div className="mb-10 animate-fade-in-up">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Store size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold font-arabic mb-2 text-indigo-950">أهلاً بيك</h1>
        <p className="text-gray-500 max-w-xs mx-auto">
          امسح كود النشاط عشان تسجل زيارتك وتجمع نقط وتاخد مكافآت
        </p>
      </div>

      <div className="w-full max-w-sm mb-8 relative">
        {isScanning ? (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden relative p-4 animate-scale-in">
            <div id="qr-reader" className="w-full"></div>
            <button 
              onClick={() => setIsScanning(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsScanning(true)}
            disabled={loading}
            className="w-full group relative flex items-center justify-center p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
          >
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Scan className="ml-3 group-hover:scale-110 transition-transform" size={28} />
            <span className="text-xl font-semibold tracking-wide">
              {loading ? 'بنتأكد...' : 'امسح الـ QR Code'}
            </span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center text-red-600 bg-red-50 px-4 py-3 rounded-xl max-w-sm w-full animate-shake border border-red-100">
          <ShieldAlert className="ml-2 flex-shrink-0" size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {/* Fallback mock button for testing without camera */}
      {!isScanning && (
        <button 
          onClick={() => processQRCode('mock-business-uuid')}
          className="mt-8 text-xs text-indigo-400 hover:text-indigo-600 underline opacity-50"
        >
          جرب من غير كاميرا (للمطورين)
        </button>
      )}

    </div>
  );
}
