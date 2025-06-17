'use client';

import {
  Home,
  ShoppingCart,
  Package,
  Sparkles,
  UserCircle,
  Menu,
  ChevronDown,
  RadioTower,
} from 'lucide-react';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import Marketplace from '@/components/marketplace/page';
import Tokenise from '@/components/tokenise/page';
import Plantations from '@/components/plantations/page';
import CronjobDashboard from '@/components/home/page';

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#34D399', '#60A5FA', '#FBBF24', '#F87171'];

const menuItems = [
  { name: 'Home', icon: Home },
  { name: 'Marketplace', icon: ShoppingCart },
  { name: 'Tokenise', icon: Package },
  { name: 'Plantations', icon: Sparkles },
  { name: 'Sensor Data Dashboard', icon: RadioTower },
];

function SidebarButtons({ active, setActive }) {
  return menuItems.map(({ name, icon: Icon }) => (
    <Button
      key={name}
      variant="ghost"
      className={`w-full justify-start gap-3 rounded-2xl px-4 py-2 text-sm transition ${
        active === name
          ? 'bg-green-100 text-green-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActive(name)}
    >
      <Icon className="w-5 h-5" />
      {name}
    </Button>
  ));
}

export default function Dashboard() {
  const router = useRouter();
  const params = useParams();
  const userID = params.userID;

  const [active, setActive] = useState('Home');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userID) return;
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) setActive(savedTab);
  }, [userID]);

  useEffect(() => {
    localStorage.setItem('activeTab', active);
  }, [active]);

  useEffect(() => {
    if (!userID) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
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
        body: JSON.stringify({ userID }),
      });

      if (res.ok) router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const totalTokens = useMemo(() => dashboardData?.tokenisations.reduce((acc, t) => acc + t.tokensIssued, 0) || 0, [dashboardData]);
  const emissionUsed = useMemo(() => {
    const sum = dashboardData?.emissions.reduce((acc, e) => acc + e.creditsUsed, 0) || 0;
    return parseFloat(sum.toFixed(10));
  }, [dashboardData]);
  const plantationCount = useMemo(() => dashboardData?.plantations.length || 0, [dashboardData]);
  const surityMap = useMemo(() => {
    const map = {};
    dashboardData?.plantations.forEach(p => {
      map[p.surityLevel] = (map[p.surityLevel] || 0) + 1;
    });
    return map;
  }, [dashboardData]);

  const sourceMap = useMemo(() => {
    const map = {};
    dashboardData?.tokenisations.forEach(t => {
      map[t.source] = (map[t.source] || 0) + 1;
    });
    return map;
  }, [dashboardData]);

  const accountAgeDays = useMemo(() => Math.floor((new Date() - new Date(dashboardData?.createdAt)) / (1000 * 60 * 60 * 24)), [dashboardData]);

  const VisualDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-gray-200"><CardContent className="p-4"><h2 className="text-sm text-gray-500">Remaining Carbon Credits Tokens</h2><p className="text-2xl font-bold">{ parseFloat(totalTokens - emissionUsed.toFixed(6))}</p></CardContent></Card>
          <Card className="rounded-2xl border border-gray-200"><CardContent className="p-4"><h2 className="text-sm text-gray-500">Tokens Used</h2><p className="text-2xl font-bold">{emissionUsed}</p></CardContent></Card>
          <Card className="rounded-2xl border border-gray-200"><CardContent className="p-4"><h2 className="text-sm text-gray-500">Carbon Credit Tokens Issued</h2><p className="text-2xl font-bold">{totalTokens}</p></CardContent></Card>
          <Card className="rounded-2xl border border-gray-200"><CardContent className="p-4"><h2 className="text-sm text-gray-500">Total Plantations</h2><p className="text-2xl font-bold">{plantationCount}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-gray-200">
            <CardContent className="p-4">
              <h2 className="mb-4 text-gray-700 font-semibold">Token Sources</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={Object.entries(sourceMap).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" outerRadius={80} label>
                    {Object.entries(sourceMap).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-200">
            <CardContent className="p-4">
              <h2 className="mb-4 text-gray-700 font-semibold">Surity Levels</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(surityMap).map(([level, count]) => ({ level, count }))}>
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-gray-200">
            <CardContent className="p-4">
              <h2 className="text-gray-600 font-semibold mb-5">Account Info</h2>
              <div className='space-y-3'>
                <p><strong>Email: </strong> {dashboardData.email}</p>
                <p><strong>Wallet ID: </strong> {dashboardData.walletID}</p>
                <p><strong>Account Age: </strong> {accountAgeDays} days</p>
                <p><strong>Last Login: </strong> {new Date(dashboardData.lastLoggedIn).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (!userID) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="w-1/2 h-6 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 px-6 py-8">
        <h2 className="text-2xl font-semibold mb-10 text-green-700">CarbonDash</h2>
        <nav className="space-y-2">
          <SidebarButtons active={active} setActive={setActive} />
        </nav>
        <div className="mt-auto text-xs text-gray-400 pt-10">Dashboard v1.0</div>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-white border-r border-gray-200">
          <div className="pt-10 space-y-2">
            <SidebarButtons active={active} setActive={setActive} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-gray-800">{active}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-gray-700">
                <UserCircle className="h-6 w-6" />
                <span>{dashboardData?.username || 'Loading...'}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white z-50 border border-gray-200">
              <DropdownMenuItem>
                <Link href={`/dashboard/${userID}/profile`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="p-8 bg-gray-50 flex-1">
          {active === 'Home' && <VisualDashboard />}
          {active === 'Sensor Data Dashboard' && <CronjobDashboard userID={userID} />}
          {active === 'Marketplace' && <Marketplace userID={userID} />}
          {active === 'Tokenise' && <Tokenise userID={userID} />}
          {active === 'Plantations' && <Plantations userID={userID} />}
        </main>
      </div>
    </div>
  );
}
