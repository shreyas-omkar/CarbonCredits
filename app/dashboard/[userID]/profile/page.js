'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfilePage() {
  const { userID } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    organization: '',
    role: '',
    age: '',
    walletID: '',
    lastLoggedIn: '',
    isVerified: false,
    createdAt: '',
    transactions: [],
    tokenisations: [],
    plantations: [],
    newTransactions: [],
    marketplaceListings: [],
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/dashboard/profile/${userID}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        setProfile({
          name: data.fullname || '',
          username: data.username || '',
          email: data.email || '',
          organization: data.companyName || '',
          role: data.role || '',
          age: data.age || '',
          walletID: data.walletID || '',
          lastLoggedIn: data.lastLoggedIn || '',
          isVerified: data.isVerified || false,
          createdAt: data.createdAt || '',
          transactions: data.transactions || [],
          tokenisations: data.tokenisations || [],
          plantations: data.plantations || [],
          newTransactions: data.newTransactions || [],
          marketplaceListings: data.marketplaceListings || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userID) fetchProfile();
  }, [userID]);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(`/api/dashboard/profile/${userID}`, profile);
      alert('Profile updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-16 text-lg">Loading profile...</p>
    );
  if (error)
    return (
      <p className="text-center text-red-600 mt-16 text-lg">Error: {error}</p>
    );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 py-16 px-6 md:px-12 flex flex-col items-center">
      {/* Back button */}
      <div className="w-full max-w-5xl mb-6 cursor-pointer">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          onClick={() => router.push(`/dashboard/${userID}`)}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="w-full max-w-5xl shadow-lg rounded-xl border border-gray-200 bg-white">
        <CardHeader className="flex items-center gap-5 border-b border-gray-200 px-8 py-6">
          <UserCircle className="w-14 h-14 text-green-800" />
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900 leading-tight tracking-tight">
              {profile.name}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1 font-light">{profile.username}</p>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Editable fields */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { id: 'email', label: 'Email Address', type: 'email' },
              { id: 'organization', label: 'Organization', type: 'text' },
            ].map(({ id, label, type }) => (
              <div key={id} className="flex flex-col">
                <Label
                  htmlFor={id}
                  className="mb-2 text-gray-700 font-semibold tracking-wide"
                >
                  {label}
                </Label>
                <Input
                  id={id}
                  type={type}
                  value={profile[id]}
                  onChange={handleChange}
                  className="border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent rounded-md text-gray-900"
                  autoComplete="off"
                />
              </div>
            ))}
          </section>

          <hr className="border-gray-300" />

          {/* Read-only info */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-300 pb-2 tracking-wide">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex flex-col">
                <Label className="mb-1 font-medium text-gray-600">Wallet ID</Label>
                <div className="break-words bg-gray-50 rounded-md px-4 py-3 border border-gray-200 text-gray-800 font-mono select-text shadow-sm">
                  {profile.walletID || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col">
                <Label className="mb-1 font-medium text-gray-600">Last Logged In</Label>
                <div className="bg-gray-50 rounded-md px-4 py-3 border border-gray-200 text-gray-800 font-sans shadow-sm">
                  {formatDate(profile.lastLoggedIn)}
                </div>
              </div>

              <div className="flex flex-col">
                <Label className="mb-1 font-medium text-gray-600">Account Created</Label>
                <div className="bg-gray-50 rounded-md px-4 py-3 border border-gray-200 text-gray-800 font-sans shadow-sm">
                  {formatDate(profile.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="font-medium text-gray-600 mb-0 select-none">
                  Verified Account
                </Label>
                {profile.isVerified ? (
                  <CheckCircle
                    className="text-green-600 w-6 h-6"
                    title="Verified"
                  />
                ) : (
                  <XCircle className="text-red-500 w-6 h-6" title="Not Verified" />
                )}
              </div>
            </div>
          </section>

          <hr className="border-gray-300" />

          {/* Transactions */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h3>
            {profile.transactions.length === 0 ? (
              <p className="text-gray-600">No transactions found.</p>
            ) : (
              profile.transactions.map((transaction, idx) => (
                <div
                  key={idx}
                  className="mb-6 p-4 border rounded-md bg-gray-50"
                >
                  <p className="font-semibold">
                    Date: {formatDate(transaction.date)}
                  </p>
                  <div>
                    <h4 className="font-semibold mt-2">Needs:</h4>
                    {transaction.needs.length === 0 ? (
                      <p>No needs recorded.</p>
                    ) : (
                      <ul className="list-disc list-inside">
                        {transaction.needs.map((item, i) => (
                          <li key={i}>
                            {item.item} — ${item.amount} at {item.time}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mt-2">Wants:</h4>
                    {transaction.wants.length === 0 ? (
                      <p>No wants recorded.</p>
                    ) : (
                      <ul className="list-disc list-inside">
                        {transaction.wants.map((item, i) => (
                          <li key={i}>
                            {item.item} — ${item.amount} at {item.time}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>

          <hr className="border-gray-300" />

          {/* Tokenisations */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tokenisations
            </h3>
            {profile.tokenisations.length === 0 ? (
              <p className="text-gray-600">No tokenisations recorded.</p>
            ) : (
              profile.tokenisations.map((token, idx) => (
                <div
                  key={idx}
                  className="mb-4 p-3 border rounded bg-green-50"
                >
                  <p>
                    <b>Source:</b> {token.source || 'N/A'}
                  </p>
                  <p>
                    <b>Carbon Credits:</b> {token.carbonCredits}
                  </p>
                  <p>
                    <b>Tokens Issued:</b> {token.tokensIssued}
                  </p>
                  <p>
                    <b>Issued At:</b> {formatDate(token.issuedAt)}
                  </p>
                </div>
              ))
            )}
          </section>

          <hr className="border-gray-300" />

          {/* Plantations */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Plantations
            </h3>
            {profile.plantations.length === 0 ? (
              <p className="text-gray-600">No plantations recorded.</p>
            ) : (
              profile.plantations.map((plant, idx) => (
                <div
                  key={idx}
                  className="mb-4 p-3 border rounded bg-yellow-50"
                >
                  <p>
                    <b>Location:</b> {plant.location}
                  </p>
                  <p>
                    <b>Size in Acres:</b> {plant.sizeInAcres}
                  </p>
                  <p>
                    <b>Surity Level:</b> {plant.surityLevel}
                  </p>
                  <p>
                    <b>Tokens Awarded:</b> {plant.expraTokensAwarded}
                  </p>
                  <p>
                    <b>Created At:</b> {formatDate(plant.createdAt)}
                  </p>
                </div>
              ))
            )}
          </section>

          <hr className="border-gray-300" />

          {/* Income & Expenses (newTransactions) */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Income & Expenses
            </h3>
            {profile.newTransactions.length === 0 ? (
              <p className="text-gray-600">
                No income/expense transactions recorded.
              </p>
            ) : (
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Category</th>
                    <th className="border border-gray-300 px-4 py-2">Amount</th>
                    <th className="border border-gray-300 px-4 py-2">Type</th>
                    <th className="border border-gray-300 px-4 py-2">Date</th>
                    <th className="border border-gray-300 px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.newTransactions.map((t, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-4 py-2">
                        {t.category || 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">${t.amount}</td>
                      <td className="border border-gray-300 px-4 py-2 capitalize">
                        {t.type}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {formatDate(t.date)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {t.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <div className="flex justify-end pt-6 border-t border-gray-300">
            <Button
              onClick={handleSubmit}
              className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-md font-semibold shadow-md transition duration-200"
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
