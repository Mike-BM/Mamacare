import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [role, setRole] = useState<"mother" | "hospital" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Registration successful! 🎉");
    setTimeout(() => {
      navigate(role === "mother" ? "/mother-dashboard" : "/hospital-dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MamaCare
          </h1>
        </div>

        {/* Registration Card */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/70 border border-border/50 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <h2 className="text-3xl font-semibold text-center mb-2">Create Account</h2>
          <p className="text-muted-foreground text-center mb-8">Join our maternal care community</p>

          {!role ? (
            <div className="space-y-4">
              <p className="text-center text-foreground/80 mb-6">I am a:</p>
              <Button
                variant="glass"
                size="lg"
                className="w-full justify-center text-lg hover:border-primary"
                onClick={() => setRole("mother")}
              >
                Expecting Mother 🤰
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="w-full justify-center text-lg hover:border-secondary"
                onClick={() => setRole("hospital")}
              >
                Healthcare Provider 🏥
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-input/50 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRole(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  Create Account
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
