import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, User, MessageSquare, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  online?: boolean;
}

export const MentorshipChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [partners, setPartners] = useState<ChatPartner[]>([
    { id: "1", full_name: "Dr. Achieng Otieno", role: "Obstetrician", online: true },
    { id: "2", full_name: "Nurse Beatrice", role: "Midwife", online: false },
    { id: "3", full_name: "Mama Sarah", role: "Peer Mentor", online: true },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUser || !activePartner) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activePartner.id}),and(sender_id.eq.${activePartner.id},receiver_id.eq.${currentUser.id})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`chat:${activePartner.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === activePartner.id) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, activePartner]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || !activePartner || sending) return;

    setSending(true);
    const newMessage = {
      sender_id: currentUser.id,
      receiver_id: activePartner.id,
      content: input.trim(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert([newMessage])
      .select()
      .single();

    if (error) {
      toast.error("Failed to send message");
      console.error(error);
    } else {
      setMessages((prev) => [...prev, data]);
      setInput("");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[600px] md:h-[600px] w-full bg-card/30 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-2xl">
      {/* Sidebar: Chat List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col h-[200px] md:h-full">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Messages
          </h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search mentors..." className="pl-9 bg-background/50 border-none h-9 text-sm" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {partners.map((partner) => (
              <button
                key={partner.id}
                onClick={() => setActivePartner(partner)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                  activePartner?.id === partner.id
                    ? "bg-primary/10 border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-11 h-11 border-2 border-background shadow-sm">
                    <AvatarImage src={partner.avatar_url} />
                    <AvatarFallback className="bg-secondary/20 text-secondary font-bold">
                      {partner.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {partner.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold truncate">{partner.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{partner.role}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-primary/5 h-[400px] md:h-full">
        {!activePartner ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold">Your Mentorship Hub</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Select a doctor or mentor from the list to start a conversation. Your health is our priority.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 border-b border-border bg-background/40 backdrop-blur flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={activePartner.avatar_url} />
                  <AvatarFallback>{activePartner.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm">{activePartner.full_name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${activePartner.online ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    {activePartner.online ? "Available Now" : "Currently Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-sm text-muted-foreground italic">
                      No messages yet. Start the conversation with {activePartner.full_name.split(' ')[0]}!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                      >
                        <div
                          className={`max-w-[70%] group ${
                            isMe ? "items-end" : "items-start"
                          } flex flex-col gap-1`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all duration-300 ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-tr-none hover:shadow-primary/20"
                                : "bg-muted text-foreground rounded-tl-none hover:bg-muted/80"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 border-t border-border bg-background/20">
              <form onSubmit={handleSend} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="bg-background/50 border-none rounded-2xl h-12 px-6 focus-visible:ring-primary/30"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="w-12 h-12 rounded-2xl shadow-lg shadow-primary/20 shrink-0 transition-transform active:scale-95"
                  disabled={sending || !input.trim()}
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
