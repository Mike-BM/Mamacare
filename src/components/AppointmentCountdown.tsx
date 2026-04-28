import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppointmentCountdownProps {
  date: string;
  time: string;
  doctor: string;
  hospital: string;
}

export const AppointmentCountdown = ({
  date,
  time,
  doctor,
  hospital,
}: AppointmentCountdownProps) => {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const appointmentDate = new Date(`${date} ${time}`);
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = appointmentDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else {
        setCountdown("Appointment passed");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [date, time]);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-blue)] transition-all duration-500 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-secondary" />
          Next Appointment
        </h3>
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
          Upcoming
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">Countdown</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            {countdown}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Date & Time</span>
            <span className="font-medium">{date} • {time}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <User className="w-3 h-3" />
              Doctor
            </span>
            <span className="font-medium">{doctor}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Hospital
            </span>
            <span className="font-medium">{hospital}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button variant="outline" className="w-full hover:shadow-[var(--shadow-glow-blue)]">
            Reschedule
          </Button>
          <Button variant="secondary" className="w-full hover:shadow-[var(--shadow-glow-blue)]">
            <MapPin className="w-4 h-4 mr-1" />
            Directions
          </Button>
        </div>
      </div>
    </Card>
  );
};
