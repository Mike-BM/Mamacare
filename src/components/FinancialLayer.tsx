import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Wallet, Plus, Sparkles, Check, CreditCard, Landmark, Smartphone, HelpCircle, HeartHandshake, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TRANSACTIONS = [
  { id: 1, type: "Added Funds", date: "Today", amount: 5.0, status: "completed" },
  { id: 2, type: "Telehealth Copay", date: "Yesterday", amount: -2.5, status: "completed" },
  { id: 3, type: "Added Funds", date: "Dec 10", amount: 10.0, status: "completed" },
];

const TIER_PRICES = [0, 3, 7, 15];

export const FinancialLayer = () => {
  const [priceIndex, setPriceIndex] = useState(2); // Default to $7
  const price = TIER_PRICES[priceIndex];
  
  const [walletBalance, setWalletBalance] = useState(12.5);
  const maxEmergencyFund = 50.0;
  const walletPercentage = (walletBalance / maxEmergencyFund) * 100;
  const isLowBalance = walletBalance < 10;

  const getTier = (p: number) => {
    if (p === 0) return { label: "Mama Free", isSponsor: false, perks: ["Core tracking", "5 AI msgs/day", "Community read-only", "SOS", "Offline mode"] };
    if (p === 3) return { label: "Mama Basic", isSponsor: false, perks: ["Mama Free features", "+ Unlimited AI chat", "+ 1 telemedicine call/month", "+ Community posting"] };
    if (p === 7) return { label: "Mama Plus", isSponsor: true, perks: ["Mama Basic features", "+ Priority appointments", "+ Wearable sync", "+ Partner mode"] };
    return { label: "Mama Premium", isSponsor: true, perks: ["Mama Plus features", "+ Dedicated midwife line", "+ Free emergency transport"] };
  };

  const tier = getTier(price);

  const addFunds = (amount: number) => {
    setWalletBalance((b) => Math.min(b + amount, maxEmergencyFund));
    toast.success(`Added $${amount.toFixed(2)} to your emergency wallet 💜`);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side: MamaCare Plus Card (60%) */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-gradient-to-br from-tertiary/10 via-card to-primary/10 border-white/10 glass-card h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-tertiary/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-tertiary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                      MamaCare Plus
                    </h3>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Premium Care Subscription</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-tertiary/20 text-tertiary border-tertiary/40 px-3 py-1 font-black">{tier.label}</Badge>
                  {tier.isSponsor && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]"><HeartHandshake className="w-3 h-3 mr-1"/> Sponsors 1 Mother</Badge>}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-lg font-black text-white/90">First month: Pay what you can 💕</p>
                <p className="text-sm text-white/50">Support your journey and help another mama in need.</p>
              </div>

              <div className="space-y-8 flex-1">
                {/* Animated slider */}
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-white/60 font-bold uppercase tracking-wider">Choose your tier</span>
                    <div className="text-4xl font-black bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                      ${price}
                      <span className="text-sm text-muted-foreground font-normal">/mo</span>
                    </div>
                  </div>
                  <Slider
                    value={[priceIndex]}
                    min={0}
                    max={3}
                    step={1}
                    onValueChange={(v) => setPriceIndex(v[0])}
                    className="my-8 [&_[role=slider]]:w-8 [&_[role=slider]]:h-8 [&_[role=slider]]:bg-primary transition-all cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-black text-white/40 px-1">
                    {TIER_PRICES.map((p, i) => (
                      <span key={i} className={priceIndex === i ? "text-primary scale-125 transition-all" : ""}>${p}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-white/5 font-bold text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" /> Included Features
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                    {tier.perks.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-xs text-white/80 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-to-r from-tertiary to-primary hover:scale-[0.98] transition-transform h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 mt-4"
                    >
                      {price === 0 ? "Continue Free" : `Subscribe for $${price}/mo`}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-white/10 bg-background/95 backdrop-blur-xl max-w-sm rounded-[32px]">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Complete Payment
                      </DialogTitle>
                    </DialogHeader>
                    {/* Simplified payment selection for demo */}
                    <div className="space-y-3 pt-4">
                      <Button variant="outline" className="w-full h-16 justify-between rounded-2xl border-white/10 hover:bg-white/5">
                        <span className="font-bold">M-Pesa STK Push</span>
                        <Smartphone className="w-6 h-6 text-green-500" />
                      </Button>
                      <Button variant="outline" className="w-full h-16 justify-between rounded-2xl border-white/10 hover:bg-white/5">
                        <span className="font-bold">Credit/Debit Card</span>
                        <CreditCard className="w-6 h-6 text-blue-500" />
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>

          {/* Right Side: Your Impact (40%) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-gradient-to-br from-background to-secondary/10 border-white/10 glass-card h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-white/40 mb-8 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <HeartHandshake className="w-4 h-4 text-primary" /> Your Social Impact
                </h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary drop-shadow-[0_0_15px_rgba(255,126,179,0.3)]">3</div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">Mamas helped through you</p>
                    <p className="text-sm text-white/50 mt-1">Your contributions provide safe care access.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Matching Partner</span>
                      <Badge className="bg-primary/20 text-primary border-none text-[10px]">Active</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">SF</div>
                      <span className="font-bold text-white text-sm">Safaricom Foundation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                  <ShieldCheck className="w-4 h-4" /> Trusted by 12,000+ African Mothers
                </div>
                <Button variant="link" className="text-xs text-primary p-0 h-auto font-bold uppercase tracking-widest">
                  Bulk Sponsorship for NGOs →
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Emergency Wallet (Full Width) */}
        <Card className="p-8 bg-[#0a0a10]/60 border-white/10 glass-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Emergency Wallet</h3>
                  <p className="text-sm text-white/40 font-medium">Funds locked for healthcare & transport</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black text-white">${walletBalance.toFixed(2)}</span>
                {isLowBalance && <Badge className="bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold px-3 py-1">LOW BALANCE</Badge>}
              </div>

              <div className="flex gap-3">
                {[10, 25, 50].map((a) => (
                  <Button 
                    key={a} 
                    className="flex-1 h-14 bg-white/5 hover:bg-white/10 border-white/10 rounded-2xl font-black text-lg text-white" 
                    onClick={() => addFunds(a)}
                  >
                    + ${a}
                  </Button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-64 h-64 shrink-0 flex flex-col items-center justify-center relative">
              <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="text-white/5 stroke-current" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current transition-all duration-1000 ${isLowBalance ? 'text-red-500' : 'text-secondary'}`} strokeWidth="3" strokeDasharray={`${walletPercentage}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{Math.round(walletPercentage)}%</span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Goal: $50</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {TRANSACTIONS.slice(0, 2).map(tx => (
                    <div key={tx.id} className="flex flex-col">
                      <span className="text-[10px] text-white/30 font-black uppercase tracking-wider">{tx.date}</span>
                      <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)} {tx.type}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Full Transaction History →</Button>
             </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};
