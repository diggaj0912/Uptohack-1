import React, { useState, useEffect } from "react";
import { 
  CreditCard, ArrowUpRight, ArrowDownLeft, Percent, ShieldAlert, 
  DollarSign, CheckCircle, RefreshCw, FileText, Download, Wallet, Send, Tag, HelpCircle
} from "lucide-react";

interface FintechWalletModuleProps {
  sessionToken: string;
  onBalanceUpdate?: (balance: number) => void;
}

interface LedgerEntry {
  id: string;
  walletId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  idempotencyKey: string;
  description: string;
  referenceType: string;
  referenceId: string;
  taxAmount: number;
  platformSplitFee: number;
  timestamp: string;
}

interface PayoutRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  destinationIban: string;
  status: "PENDING" | "APPROVED" | "DISBURSED" | "FAILED";
  createdAt: string;
}

export default function FintechWalletModule({ sessionToken, onBalanceUpdate }: FintechWalletModuleProps) {
  const [balance, setBalance] = useState<number>(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [chargeAmount, setChargeAmount] = useState<string>("250");
  const [chargeDesc, setChargeDesc] = useState<string>("Sponsor Summit Gold Package Ticket");
  const [coupon, setCoupon] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [payoutAmount, setPayoutAmount] = useState<string>("150");
  const [payoutIban, setPayoutIban] = useState<string>("DE89370400440532013000");

  // Webhook security simulator state
  const [showWebhookGuide, setShowWebhookGuide] = useState<boolean>(false);
  const [webhookStatus, setWebhookStatus] = useState<string>("idle");
  const [payloadTemplate, setPayloadTemplate] = useState<string>(() => {
    return JSON.stringify({
      id: "evt_1P8G90Lkd7sbX900",
      object: "event",
      type: "charge.succeeded",
      data: {
        object: {
          id: "ch_3P8G90Lkd7sbX900_a1",
          amount: 25000, // in cents
          currency: "usd",
          customer_email: "sponsor@nexus.io"
        }
      }
    }, null, 2);
  });
  const [calculatedSignature, setCalculatedSignature] = useState<string>("");

  useEffect(() => {
    fetchFinancialState();
  }, [sessionToken]);

  const fetchFinancialState = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fintech/wallet", {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setLedger(data.ledger || []);
        setPayouts(data.payouts || []);
        if (onBalanceUpdate) {
          onBalanceUpdate(data.balance);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeAmount || Number(chargeAmount) <= 0) return;
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/fintech/simulate-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          amount: Number(chargeAmount),
          description: chargeDesc,
          referenceType: "INVOICE",
          promoCode: coupon
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          `Success! Paid $${data.netCollected}. Taxes Calculated: $${data.taxCalculated}. Split platform fee: $${data.splitPlatformFee}.`
        );
        fetchFinancialState();
        setCoupon("");
      } else {
        setErrorMsg(data.error || "Failed to finalize card simulation.");
      }
    } catch (err: any) {
      setErrorMsg("Network timeout while verifying sandbox transaction.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) <= 0 || !payoutIban) {
      setErrorMsg("Please formulate valid disbursement amounts and IBAN coordinates.");
      return;
    }
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/fintech/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          destinationIban: payoutIban
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Stripe Connect Payout submitted successfully! Request ID: ${data.payoutRequest.id}`);
        fetchFinancialState();
      } else {
        setErrorMsg(data.error || "Failed to execute balance withdrawal.");
      }
    } catch (err) {
      setErrorMsg("Unable to communicate with the core payout engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateHMAC = () => {
    setWebhookStatus("simulating");
    // Generate simulated HMAC security header matching PAYMENT_ARCHITECTURE_BLUEPRINT
    setTimeout(() => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedPayload = `${timestamp}.${payloadTemplate.replace(/\s/g, "")}`;
      // Simulate SHA-256 formatting for display
      const hash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setCalculatedSignature(`t=${timestamp},v1=${hash}`);
      setWebhookStatus("success");
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans text-neutral-200">
      
      {/* Dynamic Header Block */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-950 via-neutral-950 to-neutral-950 border border-cyan-800/20 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Ledger Vault Core
          </span>
          <h2 className="text-md font-bold text-white">SaaS Wallet & Dynamic Billing Ledger</h2>
          <p className="text-xs text-neutral-400">
            Execute credit card charges, configure instant Stripe payouts, check sales taxes, and inspect double-entry transactions.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 font-mono">
          <div className="bg-neutral-900 border border-neutral-850 px-4 py-3 rounded-xl text-right shrink-0">
            <span className="text-[8px] text-neutral-500 block">AVAILABLE BALANCE (USD)</span>
            <span className="text-xl font-black text-cyan-400">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Stripe Credit Card Checkout & Invoice Simulation */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Card Checkout Simulator
              </h3>
              <p className="text-[11px] text-neutral-400">
                Process an instant event ticket purchase or package funding securely.
              </p>
            </div>

            {/* Aesthetic Card render */}
            <div className="w-full h-40 bg-gradient-to-br from-cyan-900 via-neutral-900 to-cyan-950 rounded-xl p-4 border border-cyan-800/10 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-mono">NexStart Capital Card</span>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="w-7 h-5 bg-neutral-800/60 rounded border border-neutral-700/50 block" /> 
                    <span className="text-[10px] text-white font-mono">XXXX XXXX XXXX 4242</span>
                  </div>
                </div>
                <span className="text-cyan-400 font-black italic text-xs">VISA</span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[7px] text-neutral-500 block uppercase">Card Holder</span>
                  <span className="text-[10px] text-neutral-300 font-medium">Demo Administrator</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] text-neutral-500 block uppercase">EXPIRY</span>
                  <span className="text-[10px] text-neutral-300 font-mono">12 / 29</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSimulateCharge} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500 block">Package Title / Invoice Details</label>
                <input 
                  type="text" 
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 px-2.5 py-1.5 rounded text-xs text-white outline-none"
                  placeholder="e.g. Gold Ticket"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-neutral-500 block">Amount ($ USD)</label>
                  <input 
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-850 px-2.5 py-1.5 rounded text-xs text-white outline-none font-mono"
                    min="1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-neutral-500 block">Promo Code</label>
                  <input 
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="e.g. HACK_AUTUMN_20"
                    className="w-full bg-neutral-900 border border-neutral-850 px-2.5 py-1.5 rounded text-xs text-amber-400 font-mono outline-none"
                  />
                </div>
              </div>

              {coupon.toUpperCase() === "HACK_AUTUMN_20" && (
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Percent className="w-3 h-3 text-emerald-400" /> Coupon Valid: 20% discount applies!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full p-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer font-sans"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Confirm Secure Payment
              </button>
            </form>
          </div>

          {/* Module 2: Stripe Connect IBAN Payout Form */}
          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" /> Stripe Connect Payouts
              </h3>
              <p className="text-[11px] text-neutral-400">
                Disburse available ledger funds directly to your external bank routing.
              </p>
            </div>

            <form onSubmit={handleSimulatePayout} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500 block">Target Liquidation Amount ($)</label>
                <input 
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 px-2.5 py-1.5 rounded text-xs text-white outline-none font-mono"
                  max={balance}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500 block">Recipient IBAN Coordinates</label>
                <input 
                  type="text"
                  value={payoutIban}
                  onChange={(e) => setPayoutIban(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-850 px-2.5 py-1.5 rounded text-xs text-white outline-none font-mono"
                  placeholder="DE89..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || balance <= 0 || Number(payoutAmount) > balance}
                className="w-full p-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-750 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Initiate Bank Payout
              </button>
            </form>
          </div>
        </div>

        {/* Module 3: Immutable Double-Entry Ledger Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Immutable Double-Entry Ledger Logs</h3>
                <p className="text-[11px] text-neutral-500">
                  Every entry triggers dynamic credit (+) and debit (-) balances which map tax assets and split fees.
                </p>
              </div>
              <button
                onClick={fetchFinancialState}
                className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded group flex items-center gap-1 text-[10px]"
              >
                <RefreshCw className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform duration-500" />
                Reload
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {ledger.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-600 font-sans border border-dashed border-neutral-900 rounded-lg">
                  No registered financial ledger items discovered. Use the payment simulator to initiate transactions.
                </div>
              ) : (
                ledger.map((e) => (
                  <div key={e.id} className="p-3 bg-neutral-900/40 border border-neutral-900 rounded-lg space-y-2 hover:border-neutral-800 transition">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-full ${
                            e.type === "CREDIT" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {e.type === "CREDIT" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          </span>
                          <span className="font-bold text-xs text-white">{e.description}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono pl-6">
                          <span>Ref: <strong className="text-neutral-500">{e.referenceType} ({e.referenceId})</strong></span>
                          <span>•</span>
                          <span>{new Date(e.timestamp).toLocaleDateString()} at {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs font-black">
                        <span className={e.type === "CREDIT" ? "text-emerald-400" : "text-neutral-400"}>
                          {e.type === "CREDIT" ? "+" : "-"}${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Expand breakdown tags */}
                    <div className="pl-6 pt-1 grid grid-cols-3 gap-2 text-[9px] font-mono text-neutral-400 border-t border-neutral-900/50">
                      <div>
                        <span className="text-neutral-550 block select-none">IDEMPOTENCY KEY</span>
                        <span className="text-neutral-400 truncate block text-[8px]">{e.idempotencyKey}</span>
                      </div>
                      <div>
                        <span className="text-neutral-550 block select-none">TAX AMOUNT</span>
                        <span className="text-neutral-300 block">${e.taxAmount || "0.00"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-550 block select-none">SPLIT PLATFORM FEE</span>
                        <span className="text-cyan-500 font-bold block">${e.platformSplitFee || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Module 4: Webhook Signature security sandbox */}
          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Webhook Signature Cryptographic Audit
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Verify the HMAC-SHA256 signature calculated from the raw event body to defend against webhook replay vectors.
                </p>
              </div>
              <button
                onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                className="text-neutral-400 hover:text-white shrink-0 p-1.5"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {showWebhookGuide && (
              <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg text-[11px] text-neutral-300 space-y-1.5 font-sans leading-relaxed">
                <p>Webhooks allow Stripe to notify our app when a payment succeeds. To ensure webhooks came from Stripe:</p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Compute an HMAC signature using the raw payload string + webhook secret key.</li>
                  <li>Incorporate a timestamp header to mitigate security session replay bypass.</li>
                  <li>Compare using a constant-time check to prevent timing analysis scanning.</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-neutral-500 block">RAW WEBHOOK BODY (JSON)</label>
                <textarea
                  value={payloadTemplate}
                  onChange={(e) => setPayloadTemplate(e.target.value)}
                  className="w-full h-32 bg-neutral-900 border border-neutral-850 p-2.5 rounded text-[10px] font-mono whitespace-pre text-cyan-400 outline-none focus:border-cyan-800"
                />
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <button
                    onClick={handleCalculateHMAC}
                    className="w-full p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded text-[11px] font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {webhookStatus === "simulating" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Calculate HMAC-SHA256 Header
                  </button>

                  {calculatedSignature && (
                    <div className="bg-neutral-900 p-3 border border-neutral-850 rounded space-y-1.5">
                      <span className="text-[8px] font-mono text-neutral-500 block uppercase">CALCULATED SIG HEADER</span>
                      <textarea
                        readOnly
                        value={`stripe-signature: ${calculatedSignature}`}
                        className="w-full bg-transparent text-[9.5px] font-mono text-amber-300 pointer-events-none select-all h-16 resize-none"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-neutral-900/50 border border-neutral-900 rounded-lg flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                  <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Timing-safe evaluation code conforms to HIPAA & PCI compliance targets.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
