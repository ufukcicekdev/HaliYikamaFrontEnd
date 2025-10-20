'use client';

import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { 
  CreditCardIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethod {
  id: number;
  card_type: string;
  card_last_four: string;
  card_holder_name: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
  created_at: string;
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/auth/payment-methods/');
      if (response.success && response.data) {
        setPaymentMethods(Array.isArray(response.data) ? response.data : response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: number) => {
    try {
      const response = await apiClient.post(`/auth/payment-methods/${paymentMethodId}/set_default/`);
      if (response.success) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleRemove = async (paymentMethodId: number) => {
    if (!confirm('Bu ödeme yöntemini kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/auth/payment-methods/${paymentMethodId}/remove/`);
      if (response.success) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
    }
  };

  const getCardBrandIcon = (cardType: string) => {
    // You can add specific card brand icons here
    return '💳';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ödeme Yöntemlerim</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kayıtlı kartlarınızı görüntüleyin ve yönetin
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Bilgi:</strong> Ödeme yöntemleri iyzico tarafından güvenli bir şekilde saklanmaktadır. 
          Yeni kart eklemek için rezervasyon sırasında ödeme adımında "Kaydet" seçeneğini işaretleyin.
        </p>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
            >
              {/* Card Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              
              {method.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Varsayılan
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-8">
                <span className="text-2xl">{getCardBrandIcon(method.card_type)}</span>
                <span className="text-xs uppercase tracking-wider text-gray-400">
                  {method.card_type}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xl tracking-wider">
                  •••• •••• •••• {method.card_last_four}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 mb-1">KART SAHİBİ</p>
                  <p className="text-sm font-medium">{method.card_holder_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">SON KULLANMA</p>
                  <p className="text-sm font-medium">
                    {method.expiry_month}/{method.expiry_year}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 font-medium rounded-lg transition-colors"
                  >
                    Varsayılan Yap
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  className="px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium rounded-lg transition-colors"
                >
                  Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Kayıtlı kart yok</h3>
          <p className="mt-1 text-sm text-gray-500">
            İlk rezervasyonunuz sırasında ödeme yaparken kartınızı kaydedebilirsiniz
          </p>
        </div>
      )}
    </div>
  );
}
