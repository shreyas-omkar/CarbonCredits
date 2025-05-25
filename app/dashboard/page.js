'use client';

import {
  Home,
  ShoppingCart,
  Package,
  Sparkles,
  UserCircle,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

const menuItems = [
  { name: 'Home', icon: Home },
  { name: 'Marketplace', icon: ShoppingCart },
  { name: 'Tokenise', icon: Package },
  { name: 'Plantations', icon: Sparkles },
];

export default function Dashboard() {
  const [active, setActive] = useState('Home');

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 px-6 py-8">
        <h2 className="text-2xl font-semibold mb-10 text-green-700">
          CarbonDash
        </h2>
        <nav className="space-y-2">
          {menuItems.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                active === name
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActive(name)}
            >
              <Icon className="w-5 h-5" />
              {name}
            </Button>
          ))}
        </nav>
        <div className="mt-auto text-xs text-gray-400 pt-10">
          Dashboard v1.0
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-white border-r border-gray-200">
          <div className="pt-10 space-y-2">
            {menuItems.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  active === name
                    ? 'bg-green-100 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActive(name)}
              >
                <Icon className="w-5 h-5" />
                {name}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-gray-800">{active}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-700"
              >
                <UserCircle className="h-6 w-6" />
                <span>Shreyas</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200">
              <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content Area */}
        <main className="p-8 bg-gray-50 flex-1">
          <p className="text-gray-600 mb-6 max-w-2xl">
            Welcome to the Carbon Credits Dashboard. Monitor your carbon credits,
            manage plantations, and trade tokens responsibly.
          </p>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Current Balance
                </h3>
                <p className="text-2xl font-bold text-green-700">
                  1,245 CC
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Marketplace Activity
                </h3>
                <p className="text-gray-700">Tokens traded today: 350</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Plantations Managed
                </h3>
                <p className="text-gray-700">Active plantations: 12</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
