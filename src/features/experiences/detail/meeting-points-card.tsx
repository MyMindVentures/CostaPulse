import { ChevronRight, MapPin } from "lucide-react";
import type { ExperienceDetailLocation } from "@/server/repositories/catalog";

type MeetingPointsCardProps = {
  locations: ExperienceDetailLocation[];
};

export function MeetingPointsCard({ locations }: MeetingPointsCardProps) {
  if (locations.length === 0) return null;

  return (
    <section className="xp-meeting-card" aria-labelledby="meeting-points-title">
      <h2 id="meeting-points-title">Meeting Points</h2>
      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            <a href="#location">
              <span className="xp-meeting-icon" aria-hidden>
                <MapPin size={16} />
              </span>
              <span>
                <strong>{location.name}</strong>
                {location.meetingInstructions ? (
                  <em>{location.meetingInstructions}</em>
                ) : null}
              </span>
              <ChevronRight size={18} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
