import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, User, Video, MapPin, 
  ChevronRight, ArrowLeft, CheckCircle2, AlertCircle,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BookingFlowProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingFlow = ({ onClose, onSuccess }: BookingFlowProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    provider: null as any,
    date: "May 6, 2026",
    slot: "09:00 AM",
    type: 'in_person',
    reason: '',
    urgentSymptoms: 'no',
    medications: ''
  });

  const providers = [
    { id: 1, name: "Dr. Eliza Keith", role: "Obstetrician", image: "https://api.dicebear.com/7.x/notionists/svg?seed=eliza" },
    { id: 2, name: "Nurse Sarah", role: "Midwife", image: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah" },
    { id: 3, name: "Dr. Emily Chen", role: "Specialist", image: "https://api.dicebear.com/7.x/notionists/svg?seed=emily" },
  ];

  const availableDates = ["May 6, 2026", "May 7, 2026", "May 8, 2026"];
  const availableSlots = ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleBook = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Booking your appointment...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || '00000000-0000-0000-0000-000000000000';

      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          doctorId: formData.provider?.id || 1,
          time: `${formData.date} ${formData.slot}`,
          amount: 50.00
        })
      });

      if (!response.ok) throw new Error("Failed to book appointment");

      toast.success("Booking successful! SMS confirmation sent.", { id: toastId });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Booking failed. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {step > 1 && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h3 className="text-xl font-black text-white">Book Appointment</h3>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-right">
          <p className="text-sm text-white/50 font-medium uppercase tracking-widest">Step 1: Select Provider</p>
          <div className="space-y-3">
            {providers.map((p) => (
              <Card 
                key={p.id}
                className={`p-4 glass-card border-white/10 hover:border-primary/50 transition-all cursor-pointer group ${formData.provider?.id === p.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => { setFormData({ ...formData, provider: p }); handleNext(); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-full border border-white/10" />
                    <div>
                      <h4 className="font-bold text-white">{p.name}</h4>
                      <p className="text-xs text-white/50">{p.role}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
            <Button 
              variant="outline" 
              className="w-full h-14 border-dashed border-white/20 hover:border-primary/50 text-white/50 hover:text-primary rounded-2xl font-bold"
              onClick={() => { setFormData({ ...formData, provider: { name: 'First Available', role: 'Any Specialist' } }); handleNext(); }}
            >
              First Available Provider
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in-right">
          <p className="text-sm text-white/50 font-medium uppercase tracking-widest">Step 2: Pick Date & Time</p>
          
          <div className="space-y-4">
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {availableDates.map(date => (
                <button
                  key={date}
                  className={`px-4 py-3 rounded-2xl border transition-all whitespace-nowrap font-bold text-sm ${formData.date === date ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}
                  onClick={() => setFormData({ ...formData, date })}
                >
                  {date}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
               {availableSlots.map(slot => (
                 <button
                   key={slot}
                   className={`p-4 rounded-2xl border transition-all font-bold text-center ${formData.slot === slot ? 'bg-secondary border-secondary text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}
                   onClick={() => setFormData({ ...formData, slot })}
                 >
                   <Clock className="w-4 h-4 mx-auto mb-2 opacity-50" />
                   {slot}
                 </button>
               ))}
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.type === 'in_person' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/50'}`}
                onClick={() => setFormData({ ...formData, type: 'in_person' })}
               >
                 <MapPin className="w-5 h-5" />
                 <span className="text-xs font-bold">In-Person</span>
               </button>
               <button 
                className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.type === 'video' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/50'}`}
                onClick={() => setFormData({ ...formData, type: 'video' })}
               >
                 <Video className="w-5 h-5" />
                 <span className="text-xs font-bold">Video Call</span>
               </button>
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50"
            disabled={!formData.date || !formData.slot}
            onClick={handleNext}
          >
            Continue
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-in-right">
          <p className="text-sm text-white/50 font-medium uppercase tracking-widest">Step 3: Pre-Visit Questionnaire</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-xs font-bold text-white/70">What brings you in today?</label>
               <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-primary/50 min-h-[100px]"
                placeholder="Briefly describe your symptoms or reason for visit..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
               />
            </div>

            <div className="space-y-3">
               <label className="text-xs font-bold text-white/70">Any urgent symptoms? (bleeding, severe pain)</label>
               <div className="flex gap-3">
                  {['no', 'yes'].map(v => (
                    <button 
                      key={v}
                      className={`flex-1 h-12 rounded-xl border font-bold capitalize transition-all ${formData.urgentSymptoms === v ? 'bg-destructive/20 border-destructive text-destructive' : 'bg-white/5 border-white/10 text-white/50'}`}
                      onClick={() => setFormData({ ...formData, urgentSymptoms: v })}
                    >
                      {v}
                    </button>
                  ))}
               </div>
               {formData.urgentSymptoms === 'yes' && (
                 <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                   <p className="text-[10px] text-destructive font-bold leading-tight">If you are experiencing a medical emergency, please call 911 or use the SOS button immediately.</p>
                 </div>
               )}
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-white/70">Are you taking any medications?</label>
               <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-white text-sm focus:outline-none focus:border-primary/50"
                placeholder="List medications or 'None'"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
               />
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50"
            disabled={!formData.reason}
            onClick={handleNext}
          >
            Review Summary
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-fade-in-right">
          <p className="text-sm text-white/50 font-medium uppercase tracking-widest">Step 4: Final Confirmation</p>
          
          <Card className="p-6 bg-primary/5 border border-primary/20 rounded-[32px] space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">🤰</div>
                <div>
                   <h4 className="text-xl font-black text-white">{formData.provider.name}</h4>
                   <p className="text-sm text-primary font-bold">{formData.provider.role}</p>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                   <Calendar className="w-5 h-5 text-primary" />
                   <span className="font-bold">{formData.date} at {formData.slot}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                   {formData.type === 'video' ? <Video className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-primary" />}
                   <span className="font-bold">{formData.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                   <MessageSquare className="w-5 h-5 text-primary" />
                   <span className="text-sm italic line-clamp-1">"{formData.reason}"</span>
                </div>
             </div>

             <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center">SMS/WhatsApp confirmation will be sent</p>
             </div>
          </Card>

          <Button 
            className="w-full h-16 bg-primary hover:bg-primary/90 text-white text-lg font-black rounded-3xl shadow-2xl shadow-primary/40 group relative overflow-hidden disabled:opacity-50"
            onClick={handleBook}
            disabled={isSubmitting}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? "Processing..." : "Confirm Booking"}
              {!isSubmitting && <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-0 group-hover:opacity-20 transition-opacity animate-gradient-shift" />
          </Button>
        </div>
      )}
    </div>
  );
};
