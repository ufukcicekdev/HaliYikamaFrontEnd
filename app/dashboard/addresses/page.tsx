'use client';

import { apiClient } from '@/lib/api-client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Address {
  id: number;
  title: string;
  district: number;
  district_name?: string;
  address_line: string;
  building_no: string;
  apartment_no: string;
  floor: string;
  notes: string;
  is_default: boolean;
}

interface District {
  id: number;
  name: string;
}

const addressSchema = z.object({
  title: z.string().min(2, 'Adres başlığı en az 2 karakter olmalıdır'),
  district: z.string().min(1, 'İlçe seçiniz'),
  address_line: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  building_no: z.string().optional(),
  apartment_no: z.string().optional(),
  floor: z.string().optional(),
  notes: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchAddresses();
    fetchDistricts();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await apiClient.get('/auth/addresses/');
      if (response.success && response.data) {
        setAddresses(Array.isArray(response.data) ? response.data : response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await apiClient.get('/services/districts/');
      if (response.success && response.data) {
        setDistricts(Array.isArray(response.data) ? response.data : response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setValue('title', address.title);
      setValue('district', address.district.toString());
      setValue('address_line', address.address_line);
      setValue('building_no', address.building_no || '');
      setValue('apartment_no', address.apartment_no || '');
      setValue('floor', address.floor || '');
      setValue('notes', address.notes || '');
    } else {
      setEditingAddress(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    reset();
  };

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        district: parseInt(data.district),
      };

      let response;
      if (editingAddress) {
        response = await apiClient.put(`/auth/addresses/${editingAddress.id}/`, payload);
      } else {
        response = await apiClient.post('/auth/addresses/', payload);
      }

      if (response.success) {
        toast.success(editingAddress ? 'Adres güncellendi!' : 'Adres eklendi!');
        handleCloseModal();
        fetchAddresses();
      } else {
        toast.error(response.error?.message || 'İşlem başarısız oldu');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const response = await apiClient.post(`/auth/addresses/${addressId}/set_default/`);
      if (response.success) {
        toast.success('Varsayılan adres güncellendi!');
        fetchAddresses();
      } else {
        toast.error(response.error?.message || 'İşlem başarısız oldu');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/auth/addresses/${addressId}/`);
      if (response.success) {
        toast.success('Adres silindi!');
        fetchAddresses();
      } else {
        toast.error(response.error?.message || 'Silme işlemi başarısız oldu');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adreslerim</h1>
          <p className="mt-1 text-sm text-gray-600">
            Teslimat adreslerinizi yönetin
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Adres Ekle
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200 hover:border-primary-300 transition-colors relative"
            >
              {address.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Varsayılan
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <MapPinIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{address.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{address.district_name}</p>
                  <p className="mt-2 text-sm text-gray-700">{address.address_line}</p>
                  {(address.building_no || address.apartment_no || address.floor) && (
                    <p className="mt-1 text-sm text-gray-600">
                      {address.building_no && `Bina: ${address.building_no}`}
                      {address.apartment_no && ` • Daire: ${address.apartment_no}`}
                      {address.floor && ` • Kat: ${address.floor}`}
                    </p>
                  )}
                  {address.notes && (
                    <p className="mt-2 text-xs text-gray-500 italic">{address.notes}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Varsayılan Yap
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(address)}
                  className="px-3 py-2 text-sm bg-primary-50 text-primary-700 font-medium rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Kayıtlı adres yok</h3>
          <p className="mt-1 text-sm text-gray-500">İlk adresinizi ekleyerek başlayın</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Adres Ekle
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Adres Başlığı
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Ev, İş, vb."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  İlçe
                </label>
                <select
                  {...register('district')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                >
                  <option value="">İlçe seçiniz</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address_line" className="block text-sm font-medium text-gray-700">
                  Adres
                </label>
                <textarea
                  {...register('address_line')}
                  rows={3}
                  placeholder="Sokak, mahalle, vb."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
                />
                {errors.address_line && (
                  <p className="mt-1 text-sm text-red-600">{errors.address_line.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="building_no" className="block text-sm font-medium text-gray-700">
                    Bina No
                  </label>
                  <input
                    {...register('building_no')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="apartment_no" className="block text-sm font-medium text-gray-700">
                    Daire No
                  </label>
                  <input
                    {...register('apartment_no')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                    Kat
                  </label>
                  <input
                    {...register('floor')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Adres tarifi, kapı kodu, vb."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
