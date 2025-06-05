"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, CheckCircle } from "lucide-react";
import Tesseract from "tesseract.js";

export default function Plantation({ userID }) {
  const [image, setImage] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [saplings, setSaplings] = useState(null);
  const [carbonCredits, setCarbonCredits] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const uploadAndProcess = async () => {
    if (!image || !userID) {
      alert("Please select an image and ensure you're logged in.");
      return;
    }

    setUploading(true);
    setConfidence(null);
    setSaplings(null);
    setCarbonCredits(null);
    setResultMessage("");

    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng");

      const res = await axios.post(`/api/dashboard/plantation/${userID}`, {
        text, // send only text now
      });

      const { confidence, estimatedSaplings, carbonCredits, message, success } = res.data;

      setConfidence(confidence);
      setSaplings(estimatedSaplings);
      setCarbonCredits(carbonCredits);
      setResultMessage(message);

      if (!success || confidence < 0.75) {
        alert("Confidence too low (< 0.75). Submission rejected.");
      }
    } catch (err) {
      console.error("Error during receipt processing:", err);
      alert("Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-white text-green-900 overflow-auto px-4 py-10">
      <div className="relative z-30 w-full max-w-3xl space-y-10">
        <Card className="border-0 bg-white/5 backdrop-blur-md shadow-xl text-green-700 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-800">
              Upload Plantation Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 sm:px-8">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="bg-transparent border border-green-800 text-green-900"
            />
            <Button
              onClick={uploadAndProcess}
              disabled={uploading || !image}
              className="w-full bg-green-800 text-white font-bold hover:bg-green-900 transition"
            >
              {uploading ? (
                <LoaderCircle className="mr-2 animate-spin" />
              ) : (
                <CheckCircle className="mr-2" />
              )}
              {uploading ? "Processing..." : "Process Receipt"}
            </Button>

            {confidence !== null && (
              <div className="mt-4 p-4 border border-green-800 rounded bg-white/10 space-y-2">
                <p className="text-sm text-green-800 font-semibold">
                  ✅ Confidence Score: {confidence.toFixed(2)}{" "}
                  {confidence >= 0.75 ? "(Accepted)" : "(Rejected)"}
                </p>
                <p className="text-sm text-green-800 font-semibold">
                  🌱 Estimated Saplings: {saplings}
                </p>
                <p className="text-sm text-green-800 font-semibold">
                  ♻️ Carbon Credits Awarded: {carbonCredits}
                </p>
                <p className="text-sm text-green-700">{resultMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
