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

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import Marketplace from '@/components/marketplace/page';
import Tokenise from '@/components/tokenise/page';
import Plantations from '@/components/plantations/page';

const menuItems = [
  { name: 'Home', icon: Home },
  { name: 'Marketplace', icon: ShoppingCart },
  { name: 'Tokenise', icon: Package },
  { name: 'Plantations', icon: Sparkles },
];

export default function Dashboard() {
  const router = useRouter();
  const params = useParams();
  const userID = params.userID;

  const [active, setActive] = useState('Home');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if no userID - fail-safe if middleware doesn't catch
  useEffect(() => {
    if (!userID) {
      router.push('/login');
    }
  }, [userID, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userID) return;

      setLoading(true);

      try {
        const res = await fetch('/api/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID }),
        });

        const result = await res.json();
        if (result.success) {
          setDashboardData(result.data);
        } else {
          console.error('Error:', result.error);
          // Optionally redirect if unauthorized or error
          router.push('/login');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userID, router]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID }), // If needed by backend logout controller
      });

      if (res.ok) {
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    // If dashboard data failed to load (e.g. unauthorized), redirect handled above
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 px-6 py-8">
        <h2 className="text-2xl font-semibold mb-10 text-green-700">CarbonDash</h2>
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
        <div className="mt-auto text-xs text-gray-400 pt-10">Dashboard v1.0</div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50">
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
        <header className="flex z-100 justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-gray-800">{active}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-gray-700">
                <UserCircle className="h-6 w-6" />
                <span>{dashboardData?.username || 'Loading...'}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200">
              <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                <Link href={`/dashboard/${userID}/profile`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-100 cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content Area */}
        <main className="p-8 bg-gray-50 flex-1">
          {active === 'Home' && (
            <>
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
                      {/* Use real data if available */}
                      {dashboardData.currentBalance ?? '1,245'} CC
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Plantations Managed
                    </h3>
                    <p className="text-gray-700">
                      Active plantations: {dashboardData.plantationsManaged ?? 12}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {active === 'Marketplace' && <Marketplace userID={userID} />}
          {active === 'Tokenise' && <Tokenise userID={userID} />}
          {active === 'Plantations' && <Plantations userID={userID} />}
        </main>
      </div>
    </div>
  );
}
