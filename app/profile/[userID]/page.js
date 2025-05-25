'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-6 md:px-12">
      <Card className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-4">
            <UserCircle className="w-10 h-10 text-green-700" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Profile Settings
              </CardTitle>
              <p className="text-sm text-gray-500">
                Manage your account and update personal information.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <Input id="name" placeholder="Shreyas Hegde" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="shreyas@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-gray-700">
                Organization
              </Label>
              <Input
                id="company"
                placeholder="EcoTrade Inc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-gray-700">
                Role
              </Label>
              <Input id="role" placeholder="Environmental Analyst" className="mt-1" />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Password Update */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-800">
              Security Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className="text-gray-700">
                  New Password
                </Label>
                <Input id="password" type="password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirm" className="text-gray-700">
                  Confirm Password
                </Label>
                <Input id="confirm" type="password" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-100">
            <Button className="bg-green-700 text-white hover:bg-green-800">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
