"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AboutTeamMember, AboutTimelineItem, SiteContent } from "@/types/database";

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<AboutTeamMember[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as AboutTeamMember[];
  } catch {
    return [];
  }
}

export async function getTimeline(): Promise<AboutTimelineItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_timeline")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as AboutTimelineItem[];
  } catch {
    return [];
  }
}

export async function getSiteContent(
  keys: string[]
): Promise<Record<string, string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .in("key", keys);

    if (error || !data) return {};

    return (data as SiteContent[]).reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

// ─── Admin: Team ──────────────────────────────────────────────────────────────

export async function getAllTeamMembers(): Promise<AboutTeamMember[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as AboutTeamMember[];
  } catch {
    return [];
  }
}

export async function upsertTeamMember(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const id = formData.get("id") as string | null;

    const payload = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      bio: (formData.get("bio") as string) || null,
      avatar_url: (formData.get("avatar_url") as string) || null,
      display_order: Number(formData.get("display_order") ?? 0),
      is_active: formData.get("is_active") !== "false",
    };

    if (!payload.name || !payload.role) {
      return { success: false, error: "Name and role are required" };
    }

    if (id) {
      const { error } = await supabase
        .from("about_team_members")
        .update(payload)
        .eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("about_team_members")
        .insert(payload);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteTeamMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("about_team_members")
      .update({ is_active: false })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Admin: Timeline ──────────────────────────────────────────────────────────

export async function getAllTimeline(): Promise<AboutTimelineItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_timeline")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as AboutTimelineItem[];
  } catch {
    return [];
  }
}

export async function upsertTimelineItem(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const id = formData.get("id") as string | null;

    const payload = {
      year: formData.get("year") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      display_order: Number(formData.get("display_order") ?? 0),
    };

    if (!payload.year || !payload.title || !payload.description) {
      return { success: false, error: "Year, title and description are required" };
    }

    if (id) {
      const { error } = await supabase
        .from("about_timeline")
        .update(payload)
        .eq("id", id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase.from("about_timeline").insert(payload);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteTimelineItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("about_timeline")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Admin: Site Content ──────────────────────────────────────────────────────

export async function updateSiteContent(
  key: string,
  value: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("site_content").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

    if (error) return { success: false, error: error.message };

    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
