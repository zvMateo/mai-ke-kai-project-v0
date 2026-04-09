import { getAllTeamMembers, getAllTimeline, getSiteContent } from "@/lib/actions/about";
import { AboutManagerClient } from "./about-manager-client";

export default async function AdminAboutPage() {
  const [team, timeline, siteContent] = await Promise.all([
    getAllTeamMembers(),
    getAllTimeline(),
    getSiteContent(["about_quote", "about_quote_author", "about_video_id"]),
  ]);

  return (
    <AboutManagerClient
      initialTeam={team}
      initialTimeline={timeline}
      initialSiteContent={siteContent}
    />
  );
}
