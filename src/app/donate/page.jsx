"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import Script from 'next/script';

const DONATION_TIERS = {
  bronze: {
    name: "Bronze Donor",
    price: 50000,
    color: "from-orange-500 to-orange-600",
    perks: ["Custom name badge in header", "Bronze badge on profile", "Donor title"],
  },
  silver: {
    name: "Silver Donor",
    price: 100000,
    color: "from-gray-400 to-gray-500",
    perks: ["All Bronze perks", "Silver badge on profile", "Featured on leaderboard", "Early access to features"],
  },
  gold: {
    name: "Gold Donor",
    price: 250000,
    color: "from-yellow-400 to-yellow-500",
    perks: ["All Silver perks", "Gold badge on profile", "Special name color", "Monthly supporter badge", "VIP status"],
  },
  platinum: {
    name: "Platinum Donor",
    price: 500000,
    color: "from-blue-300 to-purple-400",
    perks: [
      "All Gold perks",
      "Platinum badge on profile",
      "Custom name color",
      "Lifetime supporter badge",
      "Priority support",
      "Ad-free experience",
    ],
  },
};

export default function DonatePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedTier, setSelectedTier] = useState("gold");
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Please Login First</h1>
          <p className="text-[#94a3b8] mb-8">You need to be logged in to make a donation.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-[#f59e0b] text-black font-bold rounded-lg hover:bg-[#d97706] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleDonate = async (amount) => {
    if (!amount || amount < 10000) {
      alert("Minimum donation is Rp10,000");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/donations/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          donorTier: selectedTier,
          description: `Donation as ${DONATION_TIERS[selectedTier].name}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.error || "Failed to create donation");
      }

      // Load Midtrans Snap
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: async (result) => {
            // Verify payment
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert("Thank you for your donation! 🎉");
              router.push(`/profile/${user.username}`);
            }
          },
          onError: (error) => {
            console.error("Payment error:", error);
            alert("Payment failed. Please try again.");
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message || "Failed to process donation");
      setIsProcessing(false);
    }
  };

  const donationAmount = customAmount ? parseInt(customAmount) : DONATION_TIERS[selectedTier].price;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">💝 Support Our Platform</h1>
          <p className="text-[#94a3b8] text-lg mb-2">Help us create better experiences for everyone</p>
          <p className="text-[#94a3b8]">Become a donor and unlock exclusive perks!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Tiers */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Choose Your Tier</h2>

            {Object.entries(DONATION_TIERS).map(([key, tier]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTier(key);
                  setCustomAmount("");
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTier === key
                    ? `border-[#f59e0b] bg-[#1a2138]`
                    : "border-[#1f2937] bg-[#111827] hover:border-[#2d3748]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-bold ${selectedTier === key ? "text-[#f59e0b]" : "text-white"}`}>
                    {tier.name}
                  </h3>
                  <span className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    Rp{tier.price.toLocaleString()}
                  </span>
                </div>
                <ul className="text-sm text-[#94a3b8] space-y-1">
                  {tier.perks.map((perk, idx) => (
                    <li key={idx}>✓ {perk}</li>
                  ))}
                </ul>
              </button>
            ))}

            {/* Custom Amount */}
            <div className="mt-8 p-4 rounded-lg border-2 border-[#1f2937] bg-[#111827]">
              <label className="block text-sm font-semibold mb-2">Or enter custom amount:</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g., 75000"
                className="w-full px-4 py-2 bg-[#0b0e14] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#f59e0b]"
              />
              {customAmount && parseInt(customAmount) < 10000 && (
                <p className="text-sm text-red-400 mt-2">Minimum amount is Rp10,000</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border-2 border-[#f59e0b] bg-gradient-to-br from-[#f59e0b] to-[#d97706] bg-opacity-10 p-8">
              <h3 className="text-2xl font-bold mb-4">Donation Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-[#2d3748]">
                  <span className="text-[#94a3b8]">Selected Tier:</span>
                  <span className="font-bold">{DONATION_TIERS[selectedTier].name}</span>
                </div>

                <div className="flex justify-between pb-4 border-b border-[#2d3748]">
                  <span className="text-[#94a3b8]">Amount:</span>
                  <span className="text-2xl font-bold text-[#f59e0b]">Rp{donationAmount.toLocaleString()}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold">You will receive:</h4>
                  <ul className="space-y-2">
                    {DONATION_TIERS[selectedTier].perks.map((perk, idx) => (
                      <li key={idx} className="text-sm text-[#94a3b8]">
                        ✨ {perk}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleDonate(donationAmount)}
                  disabled={isProcessing || (customAmount && parseInt(customAmount) < 10000)}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black font-bold rounded-lg hover:from-[#d97706] hover:to-[#b85f00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "💳 Donate Now"}
                </button>

                <p className="text-xs text-[#94a3b8] text-center mt-4">
                  Secure payment powered by Midtrans. Your data is safe and encrypted.
                </p>
              </div>
            </div>

            {/* Benefits Info */}
            <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-6">
              <h4 className="font-bold mb-4">Why Donate?</h4>
              <ul className="space-y-3 text-sm text-[#94a3b8]">
                <li>✓ Support platform development and maintenance</li>
                <li>✓ Unlock exclusive perks and features</li>
                <li>✓ Get featured on the donors leaderboard</li>
                <li>✓ Direct influence on platform improvements</li>
                <li>✓ Lifetime donor badge and recognition</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Load Midtrans Snap */}
      <Script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
  strategy="afterInteractive" // Ini kunci agar tidak render-blocking
/>

      <Footer />
    </div>
  );
}
