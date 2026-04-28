import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft, Send, Play, Video, Users, Sparkles, EyeOff, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ROOMS = [
  { id: "t1", label: "1st Trimester", emoji: "🌱", count: 124 },
  { id: "t2", label: "2nd Trimester", emoji: "🌸", count: 218 },
  { id: "t3", label: "3rd Trimester", emoji: "🌺", count: 187 },
  { id: "pp", label: "Postpartum", emoji: "🤱🏾", count: 96 },
];

const SAMPLE_THREADS: Record<string, { author: string; text: string; replies: number; time: string }[]> = {
  t1: [
    { author: "Amina K.", text: "Morning sickness is brutal — anyone tried ginger tea?", replies: 12, time: "2h" },
    { author: "Anonymous", text: "Just got my first ultrasound. So overwhelmed 💕", replies: 24, time: "4h" },
    { author: "Zola N.", text: "What vitamins are you all taking?", replies: 8, time: "1d" },
  ],
  t2: [
    { author: "Fatima M.", text: "Felt the first kick today!! 😭", replies: 41, time: "1h" },
    { author: "Anonymous", text: "Anyone else's hair growing crazy fast?", replies: 15, time: "6h" },
  ],
  t3: [
    { author: "Grace N.", text: "Hospital bag tips for African mamas?", replies: 33, time: "3h" },
    { author: "Kemi O.", text: "Braxton Hicks vs real contractions help", replies: 19, time: "9h" },
  ],
  pp: [
    { author: "Anonymous", text: "Breastfeeding pain — when does it ease?", replies: 27, time: "5h" },
  ],
};

const BIRTH_STORIES = [
  { mom: "Adaeze, Lagos", title: "My 18-hour natural birth", duration: "4:32", verified: true },
  { mom: "Wanjiru, Nairobi", title: "Emergency C-section — what I wish I knew", duration: "6:15", verified: true },
  { mom: "Thandi, Johannesburg", title: "Home birth with my midwife", duration: "5:48", verified: true },
];

const Community = () => {
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState("t1");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [threads, setThreads] = useState(SAMPLE_THREADS);

  const post = () => {
    if (!message.trim()) return;
    const newThread = {
      author: anonymous ? "Anonymous" : "Sarah (You)",
      text: message,
      replies: 0,
      time: "now",
    };
    setThreads({ ...threads, [activeRoom]: [newThread, ...(threads[activeRoom] || [])] });
    setMessage("");
    toast.success(anonymous ? "Posted anonymously 🤫" : "Posted to community ✨");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Heart className="w-7 h-7 text-primary" fill="currentColor" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Community
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rooms">Chat Rooms</TabsTrigger>
            <TabsTrigger value="stories">Birth Stories</TabsTrigger>
            <TabsTrigger value="mentor">Mentors</TabsTrigger>
          </TabsList>

          {/* CHAT ROOMS */}
          <TabsContent value="rooms" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ROOMS.map((r) => (
                <Card
                  key={r.id}
                  onClick={() => setActiveRoom(r.id)}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    activeRoom === r.id
                      ? "border-primary shadow-[var(--shadow-glow-pink)] bg-primary/10"
                      : "bg-card/50 border-border/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" /> {r.count} active
                  </p>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Post anonymously</span>
                </div>
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Share in ${ROOMS.find((r) => r.id === activeRoom)?.label}...`}
                  onKeyDown={(e) => e.key === "Enter" && post()}
                />
                <Button onClick={post} disabled={!message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <div className="space-y-3">
              {(threads[activeRoom] || []).map((t, i) => (
                <Card key={i} className="p-4 bg-card/50 border-border/50 hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      {t.author === "Anonymous" ? (
                        <EyeOff className="w-4 h-4 text-white" />
                      ) : (
                        <UserCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{t.author}</span>
                        <span className="text-xs text-muted-foreground">{t.time}</span>
                      </div>
                      <p className="text-sm">{t.text}</p>
                      <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                        💬 {t.replies} replies
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* BIRTH STORIES */}
          <TabsContent value="stories" className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-tertiary/10 border-primary/20">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Verified Birth Stories
              </h3>
              <p className="text-sm text-muted-foreground">Real stories from African mothers, verified by our team.</p>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {BIRTH_STORIES.map((s, i) => (
                <Card key={i} className="overflow-hidden bg-card/50 border-border/50 hover:shadow-[var(--shadow-glow-pink)] transition-all">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-tertiary/20 to-secondary/20 flex items-center justify-center relative">
                    <Button size="icon" className="rounded-full w-14 h-14 bg-white/20 backdrop-blur-md hover:bg-white/30">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </Button>
                    <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur">{s.duration}</Badge>
                    {s.verified && (
                      <Badge className="absolute top-2 left-2 bg-primary/90">✓ Verified</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm">{s.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{s.mom}</p>
                  </div>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              <Video className="w-4 h-4 mr-2" /> Share your story (mock upload)
            </Button>
          </TabsContent>

          {/* MENTORS */}
          <TabsContent value="mentor" className="space-y-4">
            {[
              { name: "Mama Adwoa", years: 12, kids: 4, location: "Accra, Ghana" },
              { name: "Auntie Nia", years: 8, kids: 3, location: "Kampala, Uganda" },
              { name: "Sister Lerato", years: 15, kids: 5, location: "Cape Town, SA" },
            ].map((m) => (
              <Card key={m.name} className="p-5 bg-gradient-to-br from-card to-card/50 border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-tertiary to-primary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{m.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {m.years}y experience • {m.kids} children • {m.location}
                    </p>
                  </div>
                  <Button onClick={() => toast.success(`Mentor request sent to ${m.name} 💕`)}>
                    Connect
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
