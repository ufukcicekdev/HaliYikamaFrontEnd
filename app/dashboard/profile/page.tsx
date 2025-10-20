'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  old_password: z.string().min(6, 'Mevcut şifrenizi giriniz'),
  new_password: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Şifreler eşleşmiyor",
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsEditingProfile(true);
    try {
      await updateUser(data);
      toast.success('Profil bilgileriniz güncellendi!');
      resetProfile(data);
    } catch (error: any) {
      toast.error(error?.message || 'Güncelleme başarısız oldu');
    } finally {
      setIsEditingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const response = await apiClient.post('/auth/change-password/', data);
      if (response.success) {
        toast.success('Şifreniz başarıyla değiştirildi!');
        resetPassword();
      } else {
        toast.error(response.error?.message || 'Şifre değiştirme başarısız oldu');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profil Bilgilerim</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kişisel bilgilerinizi görüntüleyin ve düzenleyin
          </p>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Ad
              </label>
              <input
                {...registerProfile('first_name')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
              />
              {profileErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Soyad
              </label>
              <input
                {...registerProfile('last_name')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
              />
              {profileErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-posta Adresi
            </label>
            <input
              {...registerProfile('email')}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              {...registerProfile('phone')}
              type="tel"
              placeholder="+90 555 123 4567"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
            />
            {profileErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isEditingProfile}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isEditingProfile ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h2>
          <p className="mt-1 text-sm text-gray-600">
            Hesap güvenliğiniz için güçlü bir şifre kullanın
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">
              Mevcut Şifre
            </label>
            <input
              {...registerPassword('old_password')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
            />
            {passwordErrors.old_password && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.old_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <input
              {...registerPassword('new_password')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
            />
            {passwordErrors.new_password && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
              Yeni Şifre Tekrar
            </label>
            <input
              {...registerPassword('confirm_password')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 placeholder-gray-400"
            />
            {passwordErrors.confirm_password && (
              <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-900">Hesap Bilgileri</h3>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Hesap Tipi:</dt>
            <dd className="text-gray-900 font-medium capitalize">{user?.user_type}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">E-posta Doğrulama:</dt>
            <dd className={`font-medium ${user?.email_verified ? 'text-green-600' : 'text-red-600'}`}>
              {user?.email_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Telefon Doğrulama:</dt>
            <dd className={`font-medium ${user?.phone_verified ? 'text-green-600' : 'text-red-600'}`}>
              {user?.phone_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-600">Üyelik Tarihi:</dt>
            <dd className="text-gray-900 font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
