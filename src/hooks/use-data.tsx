import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "./use-user";

// User profile hook
export function useProfile() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Streak hook
export function useStreak() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Topic progress hook
export function useTopicProgress() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["topic-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("topic_progress")
        .select("topic_id, status, confidence, updated_at")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Study sessions hook
export function useStudySessions(limit = 50) {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["study-sessions", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Exam results hook
export function useExams() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["exams", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Mistakes hook
export function useMistakes() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["mistakes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Notes hook
export function useNotes() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ["notes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Subject/Topics hooks (public data - no auth needed)
export function useSubjects(examType?: string) {
  return useQuery({
    queryKey: ["subjects", examType],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("subjects")
        .select("*, topics(*)")
        .order("display_order");
      
      if (examType) {
        query = query.eq("exam_type", examType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Topics for a subject
export function useTopics(subjectId: string) {
  return useQuery({
    queryKey: ["topics", subjectId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectId)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!subjectId,
  });
}

// Mutation hooks
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!user) throw new Error("Not authenticated");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

export function useUpdateTopicProgress() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async ({ topicId, status, confidence }: { topicId: string; status: string; confidence?: number }) => {
      if (!user) throw new Error("Not authenticated");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("topic_progress")
        .upsert({
          user_id: user.id,
          topic_id: topicId,
          status,
          confidence: confidence ?? 0,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-progress", user?.id] });
    },
  });
}

export function useCreateStudySession() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async (session: {
      topic_id?: string;
      subject_id?: string;
      duration_seconds: number;
      pomodoros?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          ...session,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["streak", user?.id] });
    },
  });
}