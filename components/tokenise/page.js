"use client";

import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle, CheckCircle } from "lucide-react";

export default function TokenizeCarbon({ userID }) {
  const [certificate, setCertificate] = useState(null);
  const [source, setSource] = useState("");
  const [minting, setMinting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingPurchased, setTrackingPurchased] = useState(false);
  const [latestTokenisation, setLatestTokenisation] = useState(null);
  const [loading, setLoading] = useState(true);

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
          alert(data.error || "Failed to fetch user token info");
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
      // OCR in browser
      const text = await extractTextFromImage(certificate);

      // Send extracted text to backend
      const res = await fetch(`/api/dashboard/tokenisation/${userID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source: source || "Unknown",
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
        <Card className="border-0 bg-white/5 backdrop-blur-md shadow-xl text-green-700 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-800">
              Tokenize Carbon Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 sm:px-8">
            {trackingPurchased && latestTokenisation ? (
              <div className="space-y-4">
                <p className="font-semibold">✅ Carbon credits already tokenized.</p>
                <p><strong>Source:</strong> {latestTokenisation.source}</p>
                <p><strong>Credits Extracted:</strong> {latestTokenisation.carbonCredits}</p>
                <p><strong>Tokens Minted:</strong> {latestTokenisation.tokensIssued}</p>
                <p><strong>Minted At:</strong> {new Date(latestTokenisation.issuedAt).toLocaleString()}</p>
              </div>
            ) : (
              <>
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
              </>
            )}

            {success && (
              <p className="text-center text-green-600 font-semibold">
                ✅ Successfully tokenized carbon credits!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
