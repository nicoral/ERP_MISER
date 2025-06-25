import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { toast, Toaster } from 'sonner';
import {
  useProfile,
  type ProfileData,
} from '../features/auth/hooks/useProfile';
import { FormInput } from '../components/common/FormInput';
import {
  updateEmployee,
  uploadEmployeeImage,
} from '../services/api/employeeService';
import { PROFILE_TEXTS } from '../config/texts';
import {
  updatePassword,
  uploadEmployeeSignature,
} from '../services/auth/authService';
import {
  EmployeesIcon,
  SettingsIcon,
  DocumentIcon,
  EditIcon,
  CheckIcon,
  XMarkIcon,
  UploadIcon,
} from '../components/common/Icons';
import { SignaturePad } from '../components/common/SignaturePad';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { data: profileData } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('draw');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateEmployee(user?.id ?? 0, {
        email: formData.email,
        phone: formData.phone,
      });
      toast.success(PROFILE_TEXTS.messages.profileUpdated);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdateProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(PROFILE_TEXTS.messages.passwordsDontMatch);
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      toast.success(PROFILE_TEXTS.messages.passwordUpdated);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdatePassword);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const updatedEmployee = await uploadEmployeeImage(user?.id ?? 0, file);
      setProfile(updatedEmployee as ProfileData);
      toast.success(PROFILE_TEXTS.messages.imageUpdated);
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdateImage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    setIsLoading(true);
    try {
      const updatedEmployee = await uploadEmployeeSignature(file);
      setProfile(updatedEmployee as ProfileData);
      toast.success(PROFILE_TEXTS.messages.signatureUpdated);
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdateSignature);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawnSignature = async (signatureData: string) => {
    setIsLoading(true);
    try {
      // Convertir el data URL a un archivo
      const response = await fetch(signatureData);
      const blob = await response.blob();
      const file = new File([blob], 'signature.png', { type: 'image/png' });

      const updatedEmployee = await uploadEmployeeSignature(file);
      setProfile(updatedEmployee as ProfileData);
      toast.success(PROFILE_TEXTS.messages.signatureUpdated);
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdateSignature);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSignature = () => {
    // Esta función se puede usar para limpiar la firma si es necesario
    console.log('Firma limpiada');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setFormData(prev => ({
        ...prev,
        email: profileData.email || '',
        phone: profileData.phone || '',
      }));
    }
  }, [profileData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {PROFILE_TEXTS.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona tu información personal, seguridad y firma digital
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar con información del usuario */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-lg">
                      <AvatarImage src={profile?.imageUrl} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {profile?.firstName?.[0]}
                        {profile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() =>
                        document.getElementById('image-upload')?.click()
                      }
                      disabled={isLoading}
                      className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      title="Cambiar foto"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {profile?.position}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {profile?.area}
                  </p>

                  {/* Información adicional */}
                  <div className="mt-6 space-y-3 text-left">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <EmployeesIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.email}
                        </p>
                        <p className="text-xs text-gray-500">Email</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <SettingsIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.documentId}
                        </p>
                        <p className="text-xs text-gray-500">Documento</p>
                      </div>
                    </div>

                    {profile?.signature && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <DocumentIcon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Firma cargada
                          </p>
                          <p className="text-xs text-gray-500">Digital</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <EmployeesIcon className="w-6 h-6" />
                  <span>Configuración de cuenta</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <TabsTrigger
                      value="profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-gray-300 data-[state=inactive]:hover:bg-gray-200 data-[state=inactive]:dark:hover:bg-gray-600"
                    >
                      <EmployeesIcon className="w-4 h-4" />
                      <span>Perfil</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="password"
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-gray-300 data-[state=inactive]:hover:bg-gray-200 data-[state=inactive]:dark:hover:bg-gray-600"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      <span>Seguridad</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="signature"
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:dark:text-gray-300 data-[state=inactive]:hover:bg-gray-200 data-[state=inactive]:dark:hover:bg-gray-600"
                    >
                      <DocumentIcon className="w-4 h-4" />
                      <span>Firma</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Información personal
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Actualiza tu información de contacto
                        </p>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                        >
                          <EditIcon className="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Correo electrónico"
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled={!isEditing || isLoading}
                          onChange={handleInputChange}
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <FormInput
                          label="Teléfono"
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          disabled={!isEditing || isLoading}
                          onChange={handleInputChange}
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>
                              {isLoading ? 'Guardando...' : 'Guardar cambios'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      )}
                    </form>
                  </TabsContent>

                  <TabsContent value="password" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Cambiar contraseña
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Asegura tu cuenta con una nueva contraseña
                      </p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <FormInput
                        label="Contraseña actual"
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        disabled={isLoading}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Nueva contraseña"
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          disabled={isLoading}
                          onChange={handleInputChange}
                          required
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <FormInput
                          label="Confirmar nueva contraseña"
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          disabled={isLoading}
                          onChange={handleInputChange}
                          required
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>
                          {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                        </span>
                      </button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signature" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Firma digital
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sube una imagen de tu firma o dibújala directamente
                      </p>
                    </div>

                    {/* Mode selector */}
                    <div className="flex space-x-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setSignatureMode('upload')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          signatureMode === 'upload'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Subir imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureMode('draw')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          signatureMode === 'draw'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        Dibujar firma
                      </button>
                    </div>

                    {/* Current signature display */}
                    {profile?.signature && (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Firma actual
                          </h4>
                          <img
                            src={profile.signature}
                            alt="Firma digital"
                            className="mx-auto block max-w-full max-h-32 sm:max-h-40 object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Upload mode */}
                    {signatureMode === 'upload' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {profile?.signature
                              ? 'Sube una nueva imagen de firma'
                              : 'No hay firma digital cargada'}
                          </p>
                          <button
                            onClick={() =>
                              document
                                .getElementById('signature-upload')
                                ?.click()
                            }
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center space-x-2 mx-auto"
                          >
                            <UploadIcon className="w-4 h-4" />
                            <span>
                              {isLoading
                                ? 'Subiendo...'
                                : 'Subir firma digital'}
                            </span>
                          </button>
                          <input
                            id="signature-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSignatureUpload}
                            disabled={isLoading}
                          />
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <p className="font-medium mb-2">Recomendaciones:</p>
                          <ul className="space-y-1 text-sm">
                            <li>• Formato: PNG, JPG, JPEG</li>
                            <li>• Tamaño máximo: 5MB</li>
                            <li>• Fondo transparente preferible</li>
                            <li>• Resolución mínima: 300 DPI</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Draw mode */}
                    {signatureMode === 'draw' && (
                      <div className="space-y-4">
                        <SignaturePad
                          onSave={handleDrawnSignature}
                          onClear={handleClearSignature}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Toaster
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-100',
            description:
              'group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400',
            actionButton:
              'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-gray-50 dark:group-[.toast]:text-gray-900',
            cancelButton:
              'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-400',
          },
        }}
      />
    </div>
  );
}
