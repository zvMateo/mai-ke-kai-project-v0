"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Testimonial } from "@/types/database";

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

export async function createTestimonial(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const payload = {
      name: formData.get("name") as string,
      location: (formData.get("location") as string) || null,
      rating: Number(formData.get("rating") ?? 5),
      text: formData.get("text") as string,
      avatar_url: (formData.get("avatar_url") as string) || null,
      is_active: formData.get("is_active") === "true",
      display_order: Number(formData.get("display_order") ?? 0),
    };

    if (!payload.name || !payload.text) {
      return { success: false, error: "Name and text are required" };
    }

    const { error } = await supabase.from("testimonials").insert(payload);
    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/packages");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateTestimonial(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const payload = {
      name: formData.get("name") as string,
      location: (formData.get("location") as string) || null,
      rating: Number(formData.get("rating") ?? 5),
      text: formData.get("text") as string,
      avatar_url: (formData.get("avatar_url") as string) || null,
      is_active: formData.get("is_active") === "true",
      display_order: Number(formData.get("display_order") ?? 0),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("testimonials")
      .update(payload)
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteTestimonial(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("testimonials")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function reorderTestimonials(
  ids: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const updates = ids.map((id, index) =>
      supabase
        .from("testimonials")
        .update({ display_order: index + 1, updated_at: new Date().toISOString() })
        .eq("id", id)
    );

    await Promise.all(updates);

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function toggleTestimonialActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("testimonials")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/");
    revalidatePath("/packages");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
