import { getHotelSettings } from "@/lib/actions/settings";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const settings = await getHotelSettings();
  return <SettingsClient settings={settings} />;
}
