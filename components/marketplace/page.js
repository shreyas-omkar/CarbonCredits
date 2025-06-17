"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoaderCircle, CheckCircle, PlusCircle } from "lucide-react";

export default function Marketplace({ userID }) {
  const [listings, setListings] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [priceCC, setPriceCC] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
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
    <main className="min-h-screen bg-white px-4 py-10 text-green-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-800 text-white"
        >
          <PlusCircle />
          {showForm ? "Cancel" : "Add Listing"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="text-xl">Create New Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <Input
              type="number"
              placeholder="Quantity *"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
            />
            <Input
              type="number"
              placeholder="Price (CC) *"
              value={priceCC}
              onChange={(e) => setPriceCC(e.target.value)}
              min={0}
              step="0.01"
            />
            <Button
              onClick={createListing}
              disabled={creating || !title.trim() || !quantity || !priceCC}
              className="w-full bg-green-800 text-white"
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
      )}

      {loading ? (
        <p className="text-gray-500 text-center italic mt-10">Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-gray-500 text-center italic mt-10">
          No listings available. Click <b>"Add Listing"</b> to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card
              key={listing._id}
              className={`border p-4 flex flex-row justify-between px-4 py-6 ${
                listing.isSold ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-col w-1/2">
                <p className="text-2xl font-bold">{listing.title}</p>
                <p className="text-base text-gray-600 mt-2">{listing.description}</p>
                <p className="text-lg font-semibold mt-2 text-green-800">Qty: {listing.quantity}</p>
              </div>
              <div className="text-right w-1/2">
                <p className="font-bold text-green-800">{listing.priceCC.toFixed(2)} CC</p>
                <Button
                  disabled={buyingId === listing._id || listing.isSold}
                  onClick={() => buyListing(listing._id)}
                  className={`mt-2 ${
                    listing.isSold
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900 text-white"
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
          ))}
        </div>
      )}
    </main>
  );
}
