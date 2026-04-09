"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface HotelSettings {
  id: string;
  hotel_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  check_in_time: string;
  check_out_time: string;
  iva_rate: number;
  currency: string;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp: string | null;
  youtube_url: string | null;
}

const DEFAULTS: Omit<HotelSettings, "id"> = {
  hotel_name: "Mai Ke Kai Surf House",
  contact_email: "maikekaisurfhouse@gmail.com",
  contact_phone: "+506 8606 9355",
  address: "Playa Tamarindo, Guanacaste, Costa Rica",
  check_in_time: "15:00",
  check_out_time: "11:00",
  iva_rate: 13,
  currency: "USD",
  instagram_url: "https://instagram.com/maikekaisurfhouse",
  facebook_url: "https://facebook.com/maikekaisurfhouse",
  whatsapp: "+506 8606 9355",
  youtube_url: null,
};

export async function getHotelSettings(): Promise<HotelSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hotel_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { id: "default", ...DEFAULTS };
    }
    return data as HotelSettings;
  } catch {
    return { id: "default", ...DEFAULTS };
  }
}

export async function updateHotelSettings(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const payload = {
      hotel_name: formData.get("hotel_name") as string,
      contact_email: formData.get("contact_email") as string,
      contact_phone: formData.get("contact_phone") as string,
      address: formData.get("address") as string,
      check_in_time: formData.get("check_in_time") as string,
      check_out_time: formData.get("check_out_time") as string,
      iva_rate: Number(formData.get("iva_rate")),
      currency: formData.get("currency") as string,
      instagram_url: (formData.get("instagram_url") as string) || null,
      facebook_url: (formData.get("facebook_url") as string) || null,
      whatsapp: (formData.get("whatsapp") as string) || null,
      youtube_url: (formData.get("youtube_url") as string) || null,
      updated_at: new Date().toISOString(),
    };

    // Try update first, then upsert if no row exists
    const { data: existing } = await supabase
      .from("hotel_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("hotel_settings")
        .update(payload)
        .eq("id", existing.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("hotel_settings")
        .insert(payload);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
