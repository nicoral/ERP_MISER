import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { toast } from 'sonner';
import { useEmployee } from '../features/employees/hooks/useEmployee';
import { FormInput } from '../components/common/FormInput';

export default function Profile() {
  const { user } = useAuth();
  const { employee } = useEmployee(user?.id);
  const [isLoading, setIsLoading] = useState(false);
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
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      toast.success('Imagen de perfil actualizada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar la imagen de perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        email: employee?.email || '',
        phone: employee?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [employee]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={employee?.imageUrl} />
                <AvatarFallback>
                  {employee?.firstName?.[0]}
                  {employee?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {employee?.firstName} {employee?.lastName}
                </h2>
                <p className="text-gray-500">{employee?.position}</p>
              </div>
              <div className="w-full">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Actualizando...' : 'Cambiar Foto'}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="password">Contraseña</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <FormInput
                      label="Correo Electrónico"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label="Teléfono"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="password">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <FormInput
                      label="Contraseña Actual"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label="Nueva Contraseña"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label="Confirmar Nueva Contraseña"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
