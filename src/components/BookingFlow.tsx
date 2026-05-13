import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, User, Video, MapPin, 
  ChevronRight, ArrowLeft, CheckCircle2, AlertCircle,
  MessageSquare, Loader2
} from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSound } from "@/hooks/useSound";

interface BookingFlowProps {
  onClose: () => void;
  onSuccess: () => void;
  initialAppointment?: any;
}

export const BookingFlow = ({ onClose, onSuccess }: BookingFlowProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    provider: initialAppointment?.providers || null,
    date: initialAppointment ? new Date(initialAppointment.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    slot: initialAppointment ? new Date(initialAppointment.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "09:00 AM",
    type: initialAppointment?.appointment_type || 'in_person',
    reason: initialAppointment?.patient_notes || '',
    urgentSymptoms: 'no',
    medications: initialAppointment?.notes?.replace('Medications: ', '') || ''
  });
  const { play, SOUNDS } = useSound();

  const [providers, setProviders] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase.from('providers').select('*').eq('is_active', true);
      if (!error && data) {
        setProviders(data);
      }
      setIsLoadingProviders(false);
    };
    fetchProviders();

    const channel = supabase
      .channel('booking-provider-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'providers' }, () => {
        fetchProviders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const availableDates = [
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    new Date(Date.now() + 172800000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  ];
  const availableSlots = ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM"];

  const handleNext = () => { play(SOUNDS.CLICK, { volume: 0.1 }); setStep(prev => prev + 1); };
  const handleBack = () => { play(SOUNDS.CLICK, { volume: 0.1 }); setStep(prev => prev - 1); };

  const handleBook = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Booking your appointment...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // First, get the mother_id for the current user
      const { data: motherData, error: motherError } = await supabase
        .from('mothers')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      if (motherError || !motherData) throw new Error("Could not find mother profile");

      if (initialAppointment) {
        // Reschedule - UPDATE
        const { error } = await supabase
          .from('appointments')
          .update({
            appointment_date: new Date(`${formData.date} ${formData.slot}`).toISOString(),
            appointment_type: formData.type,
            status: 'pending',
            patient_notes: formData.reason,
            notes: formData.medications ? `Medications: ${formData.medications}` : ''
          })
          .eq('id', initialAppointment.id);
        if (error) throw error;
      } else {
        // New Booking - INSERT
        const { error } = await supabase
          .from('appointments')
          .insert({
            mother_id: motherData.id,
            provider_id: formData.provider?.id,
            appointment_date: new Date(`${formData.date} ${formData.slot}`).toISOString(),
            appointment_type: formData.type,
            status: 'pending',
            patient_notes: formData.reason,
            notes: formData.medications ? `Medications: ${formData.medications}` : ''
          });
        if (error) throw error;
      }

      toast.success("Booking successful! SMS confirmation sent.", { id: toastId });
      play(SOUNDS.SUCCESS);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Booking failed. Please try again.", { id: toastId });
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
            {isLoadingProviders ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Loading Doctors...</p>
              </div>
            ) : providers.map((p) => (
              <Card 
                key={p.id}
                className={`p-4 glass-card border-white/10 hover:border-primary/50 transition-all cursor-pointer group ${formData.provider?.id === p.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => { setFormData({ ...formData, provider: p }); handleNext(); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">👩‍⚕️</div>
                    <div>
                      <h4 className="font-bold text-white">{p.full_name}</h4>
                      <p className="text-xs text-white/50">{p.role} • {p.specialty}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
            {!isLoadingProviders && providers.length === 0 && (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-white/60 font-bold">No providers available today.</p>
                <p className="text-xs text-white/30 mt-1">Please try again later or contact support.</p>
              </div>
            )}
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
                    <h4 className="text-xl font-black text-white">{formData.provider.full_name || formData.provider.name}</h4>
                    <p className="text-sm text-primary font-bold">{formData.provider.role} {formData.provider.specialty ? `• ${formData.provider.specialty}` : ''}</p>
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
