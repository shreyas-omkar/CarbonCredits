"use client";

import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle, CheckCircle, Info } from "lucide-react";

export default function TokenizeCarbon({ userID }) {
  const [certificate, setCertificate] = useState(null);
  const [source, setSource] = useState("");
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingPurchased, setTrackingPurchased] = useState(false);
  const [latestTokenisation, setLatestTokenisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(false); // Toggle for test mode

  useEffect(() => {
    const fetchUserTokenStatus = async () => {
      try {
        const res = await fetch(`/api/dashboard/tokenisation/${userID}`);
        const data = await res.json();

        if (res.ok) {
          setTrackingPurchased(data.trackingPurchased);
          const tokens = data.tokenisations || [];
          if (tokens.length > 0) {
            const latest = tokens[tokens.length - 1];
            setLatestTokenisation(latest);
          }
        } else {
          alert(data.error || "Failed to fetch token info");
        }
      } catch (err) {
        alert("Error fetching token info: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTokenStatus();
  }, [userID]);

  const extractTextFromImage = async (file) => {
    const { data } = await Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    });
    return data.text;
  };

  const handleMint = async () => {
    if (!certificate) {
      alert("Please upload a carbon credit certificate.");
      return;
    }

    setMinting(true);
    setSuccess(false);

    try {
      const text = await extractTextFromImage(certificate);

      const res = await fetch(`/api/dashboard/tokenisation/${userID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source: source || "Unknown",
          testMode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Tokenization failed");
      }

      const responseData = await res.json();
      setSuccess(true);
      setTrackingPurchased(true);
      setLatestTokenisation({
        carbonCredits: responseData.carbonCredits,
        tokensIssued: responseData.tokensIssued,
        issuedAt: new Date().toISOString(),
        source: source || "Unknown",
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-lg">Loading...</p>;
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-white text-green-900 overflow-auto px-4 py-10">
      <div className="relative z-30 w-full max-w-3xl space-y-10">
        <Card className="border-0 bg-white/5 backdrop-blur-lg shadow-xl text-green-700 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-800">
              Tokenize Carbon Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 sm:px-8">

            {/* If already tokenized */}
            {trackingPurchased && latestTokenisation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-green-300 rounded-xl bg-green-50">
                  <p className="text-sm text-green-600 font-medium"> Source</p>
                  <p className="text-lg font-bold text-green-900">
                    {latestTokenisation.source}
                  </p>
                </div>

                <div className="p-4 border border-green-300 rounded-xl bg-green-50">
                  <p className="text-sm text-green-600 font-medium"> Carbon Credits</p>
                  <p className="text-lg font-bold text-green-900">
                    {latestTokenisation.carbonCredits}
                  </p>
                </div>

                <div className="p-4 border border-green-300 rounded-xl bg-green-50">
                  <p className="text-sm text-green-600 font-medium"> Tokens Minted</p>
                  <p className="text-lg font-bold text-green-900">
                    {latestTokenisation.tokensIssued}
                  </p>
                </div>

                <div className="p-4 border border-green-300 rounded-xl bg-green-50">
                  <p className="text-sm text-green-600 font-medium"> Minted At</p>
                  <p className="text-lg font-bold text-green-900">
                    {new Date(latestTokenisation.issuedAt).toLocaleString()}
                  </p>
                </div>

                <div className="col-span-full text-center mt-4">
                  <p className="text-green-700 font-semibold">
                     Your carbon credits have been successfully tokenized!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 bg-green-50/40 border border-dashed border-green-300 rounded-md p-4 text-sm text-green-800">
                  <p className="flex items-center gap-2">
                    <Info size={16} /> <strong>Step-by-step to Tokenize:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-4 text-green-700">
                    <li>Upload your Carbon Credit Certificate (image format)</li>
                    <li>Enter the source (e.g., Plantation, Solar Offset, etc.)</li>
                    <li>Enable <strong>Test Mode</strong> if you’re running a demo</li>
                    <li>Click <strong>"Tokenize & Mint"</strong> to convert it to digital tokens</li>
                    <li>Done! You’ll see your minted token details here</li>
                  </ol>
                </div>

                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCertificate(file);
                  }}
                  className="bg-transparent border border-green-800 text-green-900 focus:ring-green-700"
                />

                <Input
                  type="text"
                  placeholder="Certificate Source (e.g., Plantation)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-transparent border border-green-800 text-green-900 focus:ring-green-700"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="test-mode"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="w-4 h-4 text-green-700 border-green-400 rounded"
                  />
                  <label htmlFor="test-mode" className="text-sm text-green-700">
                    Enable Test Mode (bypass yearly restriction)
                  </label>
                </div>

                <Button
                  onClick={handleMint}
                  disabled={minting || !certificate}
                  className="w-full bg-green-800 text-white font-bold hover:bg-green-900 transition"
                >
                  {minting ? (
                    <>
                      <LoaderCircle className="mr-2 animate-spin" />
                      Tokenizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" />
                      Tokenize & Mint
                    </>
                  )}
                </Button>

                {success && (
                  <p className="text-center text-green-600 font-semibold mt-4">
                     Successfully tokenized carbon credits!
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
