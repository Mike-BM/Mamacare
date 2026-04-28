import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useGeminiChat = () => {
  const sendMessage = useCallback(async (text: string) => {
    try {
      let userId = '00000000-0000-0000-0000-000000000000';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) userId = session.user.id;
      } catch (e) {
        console.error("Auth fetch failed", e);
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          language: 'English',
          userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return {
        reply: data.message,
        riskLevel: data.riskLevel
      };
    } catch (err) {
      console.error(err);
      return {
        reply: "I'm sorry my dear, I'm having trouble connecting right now.",
        riskLevel: "low"
      };
    }
  }, []);

  return { sendMessage };
};
