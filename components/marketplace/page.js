"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoaderCircle, CheckCircle } from "lucide-react";

export default function Marketplace({ userID }) {
  const [listings, setListings] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [priceCC, setPriceCC] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [buyingId, setBuyingId] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/dashboard/marketplace/${userID}`);
      setListings(res.data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const createListing = async () => {
    if (!title.trim() || !quantity || !priceCC) {
      alert("Please fill all required fields");
      return;
    }

    const qty = Number(quantity);
    const price = Number(priceCC);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      alert("Quantity must be > 0 and Price must be >= 0");
      return;
    }

    if (!userID) {
      alert("User ID is missing");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`/api/dashboard/marketplace/${userID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          quantity: qty,
          priceCC: price,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create listing");
      }

      await fetchListings();
      setTitle("");
      setDescription("");
      setQuantity("");
      setPriceCC("");
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const buyListing = async (listingId) => {
    if (!userID) {
      alert("User ID is missing");
      return;
    }

    setBuyingId(listingId);
    try {
      const res = await fetch(`/api/dashboard/marketplace/${userID}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Purchase failed");
      }

      await fetchListings();
    } catch (err) {
      alert(err.message);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-white text-green-900 overflow-auto px-4 py-10">
      {/* Background image */}
      <div className="absolute inset-0 z-10 bg-cover bg-center" />

      <div className="relative z-30 w-full max-w-4xl space-y-10">
        {/* Create New Listing Card */}
        <Card className="border-0 bg-white/5 backdrop-blur-md shadow-xl text-green-700 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-800">
              Create New Listing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 sm:px-8">
            <Input
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border border-green-800 text-green-900 focus:ring-green-700"
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-transparent border border-green-800 text-green-900 focus:ring-green-700"
            />
            <Input
              type="number"
              placeholder="Quantity *"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              className="bg-transparent border border-green-800 text-green-900 focus:ring-green-700"
            />
            <Input
              type="number"
              placeholder="Price (CC) *"
              value={priceCC}
              onChange={(e) => setPriceCC(e.target.value)}
              min={0}
              step="0.01"
              className="bg-transparent border border-green-800 text-green-900 focus:ring-green-700"
            />
            <Button
              onClick={createListing}
              disabled={creating || !title.trim() || !quantity || !priceCC}
              className="w-full bg-green-800 text-white font-bold hover:bg-green-900 transition"
            >
              {creating ? (
                <LoaderCircle className="mr-2 animate-spin" />
              ) : (
                <CheckCircle className="mr-2" />
              )}
              {creating ? "Creating..." : "Create Listing"}
            </Button>
          </CardContent>
        </Card>

        {/* Listings Section */}
        <Card className="border-0 bg-white/5 backdrop-blur-md shadow-xl text-green-700 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-800">
              Marketplace Listings
            </CardTitle>
          </CardHeader>

{/* oprn */}

          <CardContent className="space-y-6 px-6 sm:px-8">
  {loading ? (
    <p className="text-center text-green-700">Loading listings...</p>
  ) : listings.length === 0 ? (
    <p className="text-center text-green-700">No listings available.</p>
  ) : (
    listings.map((listing) => (
      <Card
        key={listing._id}
        className={`w-full bg-white/10 border border-green-800 rounded-xl p-6 flex justify-between  ${
          listing.isSold ? "opacity-50" : ""
        }`}
      >
        {/* Left: Title, Description, Quantity */}
        <div className="flex flex-col space-y-1 text-left flex-grow">
          <p className="text-xl font-semibold text-green-900">
            {listing.title}
          </p>
          <p className="text-sm text-green-700 truncate">
            {listing.description || "No description"}
          </p>
          <p className="text-sm text-green-700">
            Qty: {listing.quantity}
          </p>
        </div>

        {/* Right: Price and Buy Button */}
        <div className="flex flex-col items-end justify-center ml-6 min-w-[120px]">
          <p className="text-lg font-semibold text-green-900">
            {listing.priceCC.toFixed(2)} CC
          </p>
          <Button
            disabled={buyingId === listing._id || listing.isSold}
            onClick={() => buyListing(listing._id)}
            className={`mt-2 font-semibold text-white ${
              listing.isSold
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-900"
            }`}
          >
            {listing.isSold
              ? "Sold"
              : buyingId === listing._id
              ? "Buying..."
              : "Buy"}
          </Button>
        </div>
      </Card>
    ))
  )}
</CardContent>


        </Card>
      </div>
    </main>
  );
}
