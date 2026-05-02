import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, ShieldCheck, Smartphone, CreditCard, Landmark, X, Sparkles, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PaywallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  featureName: string;
  featureValue: string;
  perks: string[];
  requiredTier?: "Basic" | "Plus" | "Premium";
  price?: number;
}

export const PaywallOverlay = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  featureName, 
  featureValue, 
  perks,
  requiredTier = "Plus",
  price = 7
}: PaywallOverlayProps) => {
  const [step, setStep] = useState<"info" | "pay" | "success">("info");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card" | "bank" | null>(null);

  const handlePay = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    // Mock payment processing
    const toastId = toast.loading(`Processing ${paymentMethod.toUpperCase()} payment...`);
    
    setTimeout(() => {
      toast.dismiss(toastId);
      setStep("success");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 2000);
  };

  const handleSuccessDone = () => {
    onSuccess();
    onClose();
    setTimeout(() => setStep("info"), 500); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md w-full">
        <AnimatePresence mode="wait">
          {step === "info" && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card border border-white/20 bg-[#0f0f1a]/95 backdrop-blur-2xl rounded-[32px] overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>
              
              <div className="p-5 sm:p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-primary/20 flex items-center justify-center relative">
                    <Lock className="w-8 h-8 text-primary" />
                    <motion.div 
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-tertiary" />
                    </motion.div>
                  </div>
                </div>

                <div className="text-center space-y-2 mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-black text-white">🔒 Mama {requiredTier} Required</h2>
                  <p className="text-sm sm:text-base text-white/70 italic px-2">"{featureValue}"</p>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4 mb-8">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-sm text-white/90 font-medium">{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Button 
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary to-secondary hover:scale-[0.98] transition-transform text-base sm:text-lg font-black rounded-2xl shadow-[0_0_25px_rgba(255,126,179,0.3)]"
                    onClick={() => setStep("pay")}
                  >
                    Unlock for ${price}/mo
                  </Button>
                  <p className="text-[9px] sm:text-[10px] text-center text-white/40 uppercase tracking-widest font-bold">Most popular • 1,200+ mamas chose this</p>
                  
                  <div className="pt-4 flex flex-col gap-3">
                    <button className="text-sm text-white/40 hover:text-white transition-colors font-bold uppercase tracking-wider underline decoration-white/20 underline-offset-4">Change Plan</button>
                    <button 
                      className="text-sm text-white/30 hover:text-white transition-colors font-medium"
                      onClick={onClose}
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "pay" && (
            <motion.div 
              key="pay"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card border border-white/20 bg-[#0f0f1a]/95 backdrop-blur-2xl rounded-[32px] overflow-hidden p-5 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Secure Payment</h2>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/50 uppercase font-bold tracking-wider">Selected Plan</p>
                  <p className="font-black text-white text-lg">Mama {requiredTier} — ${price}/mo</p>
                </div>
                <button className="text-xs text-primary font-bold hover:underline">Change</button>
              </div>

              <div className="space-y-3 mb-8">
                <button 
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${paymentMethod === 'mpesa' ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'mpesa' ? 'bg-green-500/20' : 'bg-white/10'}`}>
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'mpesa' ? 'text-green-400' : 'text-white/50'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">M-Pesa</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Instant STK Push</p>
                  </div>
                  {paymentMethod === 'mpesa' && <Check className="ml-auto w-5 h-5 text-green-400" />}
                </button>

                <button 
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${paymentMethod === 'card' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-blue-400' : 'text-white/50'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">Credit/Debit Card</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Visa, Mastercard</p>
                  </div>
                  {paymentMethod === 'card' && <Check className="ml-auto w-5 h-5 text-blue-400" />}
                </button>

                <button 
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 ${paymentMethod === 'bank' ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'bank' ? 'bg-purple-500/20' : 'bg-white/10'}`}>
                    <Landmark className={`w-6 h-6 ${paymentMethod === 'bank' ? 'text-purple-400' : 'text-white/50'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">Bank Transfer</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Show Account Details</p>
                  </div>
                  {paymentMethod === 'bank' && <Check className="ml-auto w-5 h-5 text-purple-400" />}
                </button>
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full h-14 bg-white text-[#0f0f1a] hover:bg-white/90 text-lg font-black rounded-2xl"
                  onClick={handlePay}
                >
                  Pay Now
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  Your data is encrypted 🔒
                </div>
                <p className="text-[10px] text-center text-white/30">Cancel anytime • No hidden fees</p>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card border border-white/20 bg-[#0f0f1a]/95 backdrop-blur-2xl rounded-[32px] overflow-hidden p-6 sm:p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8"
              >
                <Check className="w-12 h-12 text-green-400" />
              </motion.div>

              <div className="space-y-4 mb-8">
                <h2 className="text-3xl font-black text-white">Welcome to Mama {requiredTier}! 💕</h2>
                <p className="text-white/70">Payment confirmed. {featureName} is now unlocked for you.</p>
                <p className="text-xs text-white/40">A digital receipt has been sent to your email.</p>
              </div>

              <Button 
                className="w-full h-14 bg-gradient-to-r from-primary to-secondary text-lg font-black rounded-2xl"
                onClick={handleSuccessDone}
              >
                Start Using Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
