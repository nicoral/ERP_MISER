import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { toast, Toaster } from 'sonner';
import { useEmployee } from '../features/employees/hooks/useEmployee';
import { FormInput } from '../components/common/FormInput';
import {
  updateEmployee,
  uploadEmployeeImage,
} from '../services/api/employeeService';
import type { Employee } from '../types/employee';
import { PROFILE_TEXTS } from '../config/texts';
import { updatePassword } from '../services/auth/authService';

export default function Profile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const { employee: employeeData } = useEmployee(user?.id);
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
      await updateEmployee(user?.id ?? 0, {
        email: formData.email,
        phone: formData.phone,
      });
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdateProfile);
    } finally {
      setIsLoading(false);
      toast.success(PROFILE_TEXTS.messages.profileUpdated);
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
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdatePassword);
    } finally {
      setFormData({
        email: employee?.email || '',
        phone: employee?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const employee = await uploadEmployeeImage(user?.id ?? 0, file);
      setEmployee(employee);
      toast.success(PROFILE_TEXTS.messages.imageUpdated);
    } catch (error) {
      console.error(error);
      toast.error(PROFILE_TEXTS.messages.errorUpdateImage);
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
    if (employeeData) {
      setEmployee(employeeData);
      setFormData({
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [employeeData]);

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-8">{PROFILE_TEXTS.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{PROFILE_TEXTS.personalInfo.title}</CardTitle>
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
                <p className="text-gray-500">{employee?.area}</p>
                <p className="text-gray-500">{employee?.position}</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isLoading}
              >
                {isLoading
                  ? PROFILE_TEXTS.personalInfo.updating
                  : PROFILE_TEXTS.personalInfo.changePhoto}
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{PROFILE_TEXTS.settings.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">
                  {PROFILE_TEXTS.settings.profile}
                </TabsTrigger>
                <TabsTrigger value="password">
                  {PROFILE_TEXTS.settings.password}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <FormInput
                      label={PROFILE_TEXTS.settings.email}
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label={PROFILE_TEXTS.settings.phone}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      disabled={isLoading}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? PROFILE_TEXTS.settings.saving
                      : PROFILE_TEXTS.settings.saveChanges}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="password">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <FormInput
                      label={PROFILE_TEXTS.settings.currentPassword}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      disabled={isLoading}
                      onChange={handleInputChange}
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label={PROFILE_TEXTS.settings.newPassword}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      disabled={isLoading}
                      onChange={handleInputChange}
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label={PROFILE_TEXTS.settings.confirmPassword}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      disabled={isLoading}
                      onChange={handleInputChange}
                      type="password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? PROFILE_TEXTS.settings.updating
                      : PROFILE_TEXTS.settings.changePassword}
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
