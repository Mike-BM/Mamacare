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
        {/* MamaCare Plus Card */}
        <Card className="p-6 bg-gradient-to-br from-tertiary/10 via-card to-primary/10 border-white/10 glass-card hover:-translate-y-1 hover:shadow-lg hover:shadow-tertiary/20 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tertiary animate-pulse" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                MamaCare Plus
              </h3>
            </div>
            <div className="flex gap-2">
              {tier.isSponsor && <Badge className="bg-green-500/20 text-green-400 border-green-500/40 animate-pulse-border"><HeartHandshake className="w-3 h-3 mr-1"/> Sponsors 1 Mother</Badge>}
              <Badge className="bg-tertiary/20 text-tertiary border-tertiary/40">{tier.label}</Badge>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-bold text-white/90">First month: Pay what you can 💕</p>
            <p className="text-xs text-white/50">No credit card required. Change anytime.</p>
          </div>

          <div className="space-y-5">
            {/* Animated slider */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-medium">Choose your tier</span>
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent transform transition-all duration-300">
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
                className="my-6 [&_[role=slider]]:shadow-[0_0_15px_rgba(255,126,179,0.8)] [&_[role=slider]]:border-primary [&_[role=slider]]:w-6 [&_[role=slider]]:h-6 transition-all cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-white/50">
                <span className={priceIndex === 0 ? "text-primary scale-110 transition-all" : ""}>Free</span>
                <span className={priceIndex === 1 ? "text-primary scale-110 transition-all" : ""}>$3<br/><span className="text-[10px] font-normal">Basic</span></span>
                <span className={priceIndex === 2 ? "text-primary scale-110 transition-all" : ""}>$7<br/><span className="text-[10px] font-normal">Plus</span></span>
                <span className={priceIndex === 3 ? "text-primary scale-110 transition-all" : ""}>$15<br/><span className="text-[10px] font-normal">Premium</span></span>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full bg-background/50 rounded-xl border border-white/10 px-4">
              <AccordionItem value="features" className="border-none">
                <AccordionTrigger className="text-sm py-3 hover:no-underline hover:text-primary font-bold">What's included in {tier.label}?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pb-3">
                    {tier.perks.map((p) => (
                      <div key={p} className="flex items-center gap-3 text-sm text-white/90 animate-fade-in-up">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-medium">{p}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-center space-y-2">
              <p className="text-xs font-bold text-tertiary">Every contribution sponsors a mother in need 🤝</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-[10px] text-white/40">Why free?</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 text-white/30 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] bg-card border-white/10 text-[10px]">
                    We believe safe care is a right. Partners and members fund access for those who can't afford it.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-tertiary to-primary hover:scale-[0.98] transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,126,179,0.3)] hover:shadow-[0_0_25px_rgba(255,126,179,0.5)] h-14 text-lg font-bold rounded-xl"
                >
                  {price === 0 ? "Continue Free Forever" : `Contribute $${price}/mo — Help 1 mama`}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 bg-background/95 backdrop-blur-xl max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {price === 0 ? "You're all set!" : "Complete Contribution"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {price === 0 ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-white/80">Your Mama Free plan is active. You have access to core tracking, SOS, and AI support.</p>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 font-bold" onClick={() => toast.success("Free plan activated")}>Got it</Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-center text-muted-foreground text-sm">Select a payment method to contribute ${price}/mo. This helps us keep MamaCare free for those who need it most.</p>
                      <div className="grid grid-cols-1 gap-3">
                        <Button variant="outline" className="h-16 justify-start gap-4 bg-green-500/10 hover:bg-green-500/20 border-green-500/30" onClick={() => {toast.success("M-Pesa prompt sent to your phone");}}>
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <Smartphone className="w-6 h-6 text-green-500" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-green-400">M-Pesa</span>
                            <span className="text-xs text-green-400/70">Pay easily via mobile money</span>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-14 justify-start gap-4 hover:bg-white/5 border-white/10" onClick={() => {toast.success("Redirecting to card payment...");}}>
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold">Card</span>
                            <span className="text-xs text-muted-foreground">Visa, Mastercard</span>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-14 justify-start gap-4 hover:bg-white/5 border-white/10" onClick={() => {toast.success("Bank details copied");}}>
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold">Bank Transfer</span>
                            <span className="text-xs text-muted-foreground">Direct deposit</span>
                          </div>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex justify-center items-center gap-4 text-[10px] text-white/50 font-bold uppercase tracking-widest mt-4">
               <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-green-400"/> M-Pesa</span>
               <span>|</span>
               <span className="flex items-center gap-1">UNFPA Partner</span>
               <span>|</span>
               <span className="text-primary">❤️ No Ads</span>
            </div>
          </div>
        </Card>

        {/* Sponsorship / Social Impact Card */}
        <Card className="p-6 bg-gradient-to-b from-card to-card/50 border-white/10 glass-card">
          <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-primary" /> Your Impact
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">3</div>
            <p className="text-sm text-white/70 leading-snug">mothers you've helped access premium care through your contributions.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5 mb-4">
            <span className="text-xs text-white/50">Current partner match:</span>
            <Badge variant="outline" className="text-[10px] border-white/20">Sponsored by Safaricom</Badge>
          </div>
          <Button variant="link" className="text-xs text-primary p-0 h-auto font-normal">
            Are you an NGO? Bulk sponsor mothers here →
          </Button>
        </Card>

        {/* Emergency Wallet Card */}
        <Card className="p-6 bg-card border-white/10 glass-card hover:-translate-y-1 hover:shadow-lg transition-all duration-500 overflow-hidden relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-secondary" />
                Emergency Wallet
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Recommended fund: $50.00</p>
            </div>
            
            <div className="relative flex items-center justify-center w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="text-white/10 stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`stroke-current transition-all duration-1000 ease-out ${isLowBalance ? 'text-red-500 animate-pulse' : 'text-secondary'}`}
                  strokeWidth="3"
                  strokeDasharray={`${walletPercentage}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-sm font-bold ${isLowBalance ? 'text-red-400' : 'text-white'}`}>
                  {Math.round(walletPercentage)}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-3xl font-black text-white mb-6 flex items-center gap-2">
            ${walletBalance.toFixed(2)}
            {isLowBalance && <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full font-medium tracking-wide">LOW</span>}
          </div>

          <div className="flex gap-2 mb-6">
            {[5, 10, 20].map((a) => (
              <Button 
                key={a} 
                size="sm" 
                variant="outline" 
                className="flex-1 border-secondary/30 hover:bg-secondary/20 hover:border-secondary transition-all active:scale-95" 
                onClick={() => addFunds(a)}
              >
                <Plus className="w-3 h-3 mr-1" /> ${a}
              </Button>
            ))}
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="history" className="border-none">
              <AccordionTrigger className="text-xs py-2 hover:no-underline hover:text-secondary bg-white/5 rounded-lg px-3">
                View Transactions
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-3 px-1">
                  {TRANSACTIONS.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm animate-fade-in-up">
                      <div className="flex flex-col">
                        <span className="text-white/90">{tx.type}</span>
                        <span className="text-[10px] text-white/50">{tx.date}</span>
                      </div>
                      <span className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </TooltipProvider>
  );
};
