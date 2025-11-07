import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, BookOpen, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  entry_date: string;
  created_at: string;
}

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "🥰", label: "Grateful", value: "grateful" },
  { emoji: "😢", label: "Emotional", value: "emotional" },
];

const Journal = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("entry_date", { ascending: false });

    if (error) {
      toast.error("Failed to load journal entries");
      return;
    }

    setEntries(data || []);
  };

  const handleSaveEntry = async () => {
    if (!content.trim()) {
      toast.error("Please write something in your journal");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save entries");
      return;
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: title || "Untitled Entry",
      content,
      mood: selectedMood,
      tags,
      entry_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      toast.error("Failed to save entry");
      return;
    }

    toast.success("Journal entry saved! 💕");
    setTitle("");
    setContent("");
    setSelectedMood("");
    setTags([]);
    setIsCreating(false);
    fetchEntries();
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete entry");
      return;
    }

    toast.success("Entry deleted");
    fetchEntries();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Journal
            </h1>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="hover:shadow-[var(--shadow-glow-pink)]"
          >
            {isCreating ? "View Entries" : "New Entry"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isCreating ? (
          /* New Entry Form */
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm animate-fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Write Your Heart Out
            </h2>

            {/* Title */}
            <Input
              placeholder="Entry Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 bg-background/50"
            />

            {/* Mood Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                How are you feeling today?
              </label>
              <div className="flex gap-2 flex-wrap">
                {moods.map((mood) => (
                  <Button
                    key={mood.value}
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(mood.value)}
                    className="hover:scale-110 transition-transform"
                  >
                    <span className="text-xl mr-1">{mood.emoji}</span>
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <Textarea
              placeholder="Share your thoughts, feelings, and special moments..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-4 min-h-[200px] bg-background/50"
            />

            {/* Tags */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Add Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., milestone, doctor visit, feeling blessed"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  className="bg-background/50"
                />
                <Button onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSaveEntry}
                className="flex-1 hover:shadow-[var(--shadow-glow-pink)]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setTitle("");
                  setContent("");
                  setSelectedMood("");
                  setTags([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          /* Entries List */
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-card to-card/50 border-border/50">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Start Your Journey
                </h3>
                <p className="text-muted-foreground mb-4">
                  Capture your precious moments, feelings, and memories
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Write First Entry
                </Button>
              </Card>
            ) : (
              entries.map((entry) => {
                const mood = moods.find((m) => m.value === entry.mood);
                return (
                  <Card
                    key={entry.id}
                    className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500 animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {mood && (
                          <span className="text-3xl">{mood.emoji}</span>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {entry.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.entry_date), "MMMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
