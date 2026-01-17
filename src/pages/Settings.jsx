
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User as UserIcon, 
  Shield, 
  LogOut, 
  Crown,
  Camera,
  Save
} from 'lucide-react';
import SupportForm from '../components/settings/SupportForm';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    profile_picture: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setProfileData({
        full_name: userData.full_name || '',
        profile_picture: userData.profile_picture || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Could not load user data');
    }
    setIsLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await User.updateMyUserData(profileData);
      toast.success('Profile updated successfully!');
      await loadUserData(); // Reload to get latest data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
    
    setIsUpdating(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    
    try {
      const { file_url } = await UploadFile({ file });
      
      // Update profile data with new image URL
      const updatedData = { ...profileData, profile_picture: file_url };
      setProfileData(updatedData);
      
      // Save to database
      await User.updateMyUserData(updatedData);
      
      toast.success('Profile picture updated successfully!');
      await loadUserData(); // Reload to get latest data
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    }
    
    setIsUploadingAvatar(false);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-md animate-pulse border-2 border-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-600 text-lg">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white rounded-md shadow-lg border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-black">
                    <AvatarImage src={profileData.profile_picture} alt={user?.full_name} />
                    <AvatarFallback className="bg-gray-200 text-black text-lg font-bold">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-semibold text-black">{user?.full_name}</h3>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                  {isUploadingAvatar && (
                    <p className="text-gray-500 text-sm">Uploading...</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-black font-medium">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="rounded-md border-2 border-black"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    className="rounded-md border-2 border-black bg-gray-50"
                    disabled
                    placeholder="Email cannot be changed"
                  />
                  <p className="text-sm text-gray-500">Email address cannot be changed</p>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-black hover:bg-gray-800 text-white rounded-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="bg-white rounded-md shadow-lg border-2 border-black">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border-2 border-gray-200">
                <h4 className="font-semibold text-black mb-2">Password Reset</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Password management is handled through our secure authentication system.
                </p>
                <Button
                  variant="outline"
                  className="rounded-md border-2 border-black hover:bg-gray-100"
                  onClick={() => toast.info('Password reset functionality will be available soon')}
                >
                  Request Password Reset
                </Button>
              </div>

              <div className="bg-red-50 p-4 rounded-md border-2 border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Sign Out</h4>
                <p className="text-red-600 text-sm mb-3">
                  Sign out of your account on this device.
                </p>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="rounded-md border-2 border-red-500 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white rounded-md shadow-lg border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan:</span>
                <Badge className={`border-2 font-medium ${
                  user?.subscription_status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-200 text-black border-black'
                }`}>
                  {user?.subscription_status === 'active' ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </>
                  ) : (
                    'Free'
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role:</span>
                <Badge className="bg-gray-200 text-black border-black border-2 font-medium">
                  {user?.role || 'User'}
                </Badge>
              </div>

              <Separator className="bg-black" />
              
              <div className="text-sm text-gray-600">
                <p><strong>Member since:</strong></p>
                <p>{user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 rounded-md shadow-lg border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-gray-600">
                Having trouble with your account or need assistance?
              </p>
              <SupportForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
