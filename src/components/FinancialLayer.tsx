import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, Shield, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

const TIERS = [
  { price: 0, label: "Free", perks: ["Basic tracking", "Community access"] },
  { price: 3, label: "Essential", perks: ["AI assistant", "Weekly tips", "Mentor matching"] },
  { price: 7, label: "Plus", perks: ["Telemedicine credits", "Wearable sync", "Priority SOS"] },
  { price: 15, label: "Premium", perks: ["Unlimited video calls", "Insurance included", "24/7 nurse"] },
];

export const FinancialLayer = () => {
  const [tierIdx, setTierIdx] = useState(2);
  const [walletBalance, setWalletBalance] = useState(12.5);
  const tier = TIERS[tierIdx];

  const addFunds = (amount: number) => {
    setWalletBalance((b) => b + amount);
    toast.success(`Added $${amount.toFixed(2)} to your emergency wallet 💜`);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-tertiary/10 via-card to-primary/10 border-tertiary/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-tertiary" />
          MamaCare Plus
        </h3>
        <Badge className="bg-tertiary/20 text-tertiary border-tertiary/40">{tier.label}</Badge>
      </div>

      <div className="space-y-5">
        {/* Sliding price tier */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-muted-foreground">Choose what you can afford</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
              ${tier.price}
              <span className="text-sm text-muted-foreground font-normal">/mo</span>
            </span>
          </div>
          <Slider
            value={[tierIdx]}
            min={0}
            max={3}
            step={1}
            onValueChange={(v) => setTierIdx(v[0])}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {TIERS.map((t) => (
              <span key={t.price} className={tierIdx === TIERS.indexOf(t) ? "text-primary font-semibold" : ""}>
                ${t.price}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30">
          {tier.perks.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <Button
          className="w-full bg-gradient-to-r from-tertiary to-primary"
          onClick={() => toast.success(`Subscribed to ${tier.label} ($${tier.price}/mo) 🌟`)}
        >
          {tier.price === 0 ? "Continue free" : `Subscribe — $${tier.price}/mo`}
        </Button>

        {/* Wallet */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-sm">Emergency Wallet</span>
            </div>
            <span className="text-xl font-bold text-secondary">${walletBalance.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            {[5, 10, 25].map((a) => (
              <Button key={a} size="sm" variant="outline" className="flex-1" onClick={() => addFunds(a)}>
                <Plus className="w-3 h-3 mr-1" /> ${a}
              </Button>
            ))}
          </div>
        </div>

        {/* Insurance dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" /> Enroll in Micro-Insurance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" /> Maternal Micro-Insurance
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Enrollment submitted — confirmation in 24h ✓");
              }}
              className="space-y-3"
            >
              <div>
                <Label>Full name</Label>
                <Input required placeholder="Stacy Mutheu" />
              </div>
              <div>
                <Label>National ID / Passport</Label>
                <Input required placeholder="A12345678" />
              </div>
              <div>
                <Label>Coverage tier</Label>
                <select className="w-full mt-1 h-10 px-3 rounded-md bg-input border border-border text-sm">
                  <option>Basic — $1.50/mo</option>
                  <option>Standard — $4/mo</option>
                  <option>Comprehensive — $9/mo</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Enroll now</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
