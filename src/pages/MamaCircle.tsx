import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, ArrowLeft, UserCircle, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Post {
  id: number;
  author: string;
  content: string;
  reactions: number;
  replies: number;
  timestamp: string;
}

const MamaCircle = () => {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState("");

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Amina K.",
      content: "Just finished my 20-week scan and everything looks perfect! So grateful for this community's support. 💕",
      reactions: 24,
      replies: 8,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: "Fatima M.",
      content: "Anyone else dealing with morning sickness in the second trimester? Would love to hear your tips!",
      reactions: 15,
      replies: 12,
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      author: "Grace N.",
      content: "My baby kicked for the first time today! I can't stop crying happy tears 😭💕",
      reactions: 42,
      replies: 18,
      timestamp: "1 day ago",
    },
  ]);

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: posts.length + 1,
        author: "Stacy (You)",
        content: newPost,
        reactions: 0,
        replies: 0,
        timestamp: "Just now",
      };
      setPosts([post, ...posts]);
      setNewPost("");
      toast.success("Your post has been shared with the community!");
    }
  };

  const handleReaction = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, reactions: post.reactions + 1 } : post
    ));
    toast.success("Reaction added! ❤️");
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
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MamaCircle
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Welcome Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 animate-fade-in">
          <h2 className="text-xl font-bold mb-2">Welcome to MamaCircle! 🌸</h2>
          <p className="text-sm text-muted-foreground mb-4">
            A safe space for mothers to share experiences, tips, and support each other through this beautiful journey.
          </p>
          <Button variant="outline" className="hover:shadow-[var(--shadow-glow-blue)]">
            <Stethoscope className="w-4 h-4 mr-2" />
            Ask a Doctor
          </Button>
        </Card>

        {/* New Post Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary" />
            Share with the community
          </h3>
          <Textarea
            placeholder="Share your thoughts, experiences, or questions..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="mb-4 min-h-[100px] bg-background/50"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="text-2xl cursor-pointer hover:scale-125 transition-transform">❤️</span>
              <span className="text-2xl cursor-pointer hover:scale-125 transition-transform">👶🏾</span>
              <span className="text-2xl cursor-pointer hover:scale-125 transition-transform">🌸</span>
            </div>
            <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:shadow-[var(--shadow-glow-pink)] transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{post.author}</span>
                    <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground mb-4">{post.content}</p>
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id)}
                      className="hover:text-primary"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.reactions}
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-secondary">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.replies}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MamaCircle;
