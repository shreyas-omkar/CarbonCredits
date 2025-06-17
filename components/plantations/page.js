"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Tesseract from "tesseract.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, CheckCircle, PlusCircle } from "lucide-react";

export default function Plantation({ userID }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [plantations, setPlantations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPlantations = async () => {
      try {
        const res = await axios.get(`/api/dashboard/plantation/${userID}`);
        setPlantations(res.data.plantations || []);
      } catch (err) {
        console.error("Failed to load plantations", err);
      }
    };
    fetchPlantations();
  }, [userID]);

  const uploadAndProcess = async () => {
    if (!image || !userID) {
      alert("Please select an image and ensure you're logged in.");
      return;
    }
    setUploading(true);
    setErrorMessage("");
    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng");
      const res = await axios.post(`/api/dashboard/plantation/${userID}`, { text });

      const { success, message, ...rest } = res.data;

      if (!success) {
        setErrorMessage(message || "Submission failed");
      } else {
        setPlantations(prev => [rest, ...prev]);
        setShowForm(false);
        setImage(null);
      }
    } catch (err) {
      console.error("Error during processing:", err);
      setErrorMessage("Failed to process receipt.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-green-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"> Your Plantations</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-green-800 text-white">
          <PlusCircle /> Add Plantation
        </Button>
      </div>

      {showForm && (
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-xl">Upload Plantation Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
            <Button
              onClick={uploadAndProcess}
              disabled={uploading || !image}
              className="bg-green-700 text-white"
            >
              {uploading ? <LoaderCircle className="mr-2 animate-spin" /> : <CheckCircle className="mr-2" />}
              {uploading ? "Processing..." : "Submit"}
            </Button>
            {errorMessage && <p className="text-red-600">❌ {errorMessage}</p>}
          </CardContent>
        </Card>
      )}

      {plantations.length === 0 ? (
        <div className="text-gray-500 text-center italic mt-10">
          No plantations yet. Click the <b>"Add Plantation"</b> button to upload a receipt and get started.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-left border">
            <thead>
              <tr className="bg-green-800 text-white">
                <th className="p-3">Nursery</th>
                <th className="p-3">Location</th>
                <th className="p-3">Amount (₹)</th>
                <th className="p-3">Carbon Saved (tons)</th>
                <th className="p-3">Credits Awarded</th>
                <th className="p-3">Verified At</th>
              </tr>
            </thead>
            <tbody>
              {plantations.map((p, i) => (
                <tr key={i} className="border-b hover:bg-green-50">
                  <td className="p-3">{p.nurseryName || "Unknown"}</td>
                  <td className="p-3">{p.location || "N/A"}</td>
                  <td className="p-3">₹{p.totalAmount || 0}</td>
                  <td className="p-3">{p.carbonReducedTons?.toFixed(2) || "0.00"}</td>
                  <td className="p-3">{p.expraTokensAwarded}</td>
                  <td className="p-3">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}