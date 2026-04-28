import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Droplet, MapPin, Phone, Search } from "lucide-react";
import { toast } from "sonner";

const DONORS = [
  { name: "Tunde A.", type: "O+", distance: "0.8 km", lastDonation: "3 months ago", available: true },
  { name: "Anonymous", type: "O-", distance: "1.5 km", lastDonation: "5 months ago", available: true },
  { name: "Chioma E.", type: "A+", distance: "2.1 km", lastDonation: "2 months ago", available: true },
  { name: "Kwesi M.", type: "B+", distance: "3.4 km", lastDonation: "6 months ago", available: false },
  { name: "Zainab Y.", type: "O+", distance: "4.0 km", lastDonation: "4 months ago", available: true },
];

export const BloodDonorNetwork = () => {
  const [filter, setFilter] = useState("");
  const filtered = DONORS.filter(
    (d) => !filter || d.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Droplet className="w-5 h-5 text-destructive" fill="currentColor" />
          Blood Donor Network
        </h3>
        <Badge variant="secondary">{DONORS.filter((d) => d.available).length} available</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by blood type (e.g. O+)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="font-bold text-destructive text-sm">{d.type}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{d.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {d.distance} • Last: {d.lastDonation}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={d.available ? "default" : "secondary"}
              disabled={!d.available}
              onClick={() => toast.success(`Donor ${d.name} contacted 💜`)}
            >
              <Phone className="w-3 h-3 mr-1" />
              {d.available ? "Contact" : "Unavailable"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
