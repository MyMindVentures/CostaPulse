"use client";

import { Check } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";
import { RatingStars } from "./rating-stars";

type DetailTabsProps = {
  experience: ExperienceDetailViewModel;
};

type TabId =
  | "overview"
  | "included"
  | "itinerary"
  | "info"
  | "reviews"
  | "location";

const TAB_IDS: TabId[] = [
  "overview",
  "included",
  "itinerary",
  "info",
  "reviews",
  "location"
];

function QuickInfo({ experience }: { experience: ExperienceDetailViewModel }) {
  const durations = [
    ...new Set(
      experience.variants
        .map((variant) => variant.durationMinutes ?? experience.durationMinutes)
        .filter((value): value is number => typeof value === "number")
        .map((minutes) => `${Math.round(minutes / 60)} hours`)
    )
  ];

  const languages =
    experience.languages.length > 0
      ? experience.languages
          .map((language) => language.code.toUpperCase())
          .join(", ")
      : null;

  const meetingPoint =
    experience.locations.find((location) => location.isPrimary)?.name ??
    experience.locationName ??
    null;

  const mobileTicketPolicy = experience.policies.find(
    (policy) => policy.policyType === "mobile_ticket"
  );
  const confirmationPolicy = experience.policies.find(
    (policy) => policy.policyType === "confirmation"
  );

  const rows = [
    durations.length > 0 || experience.durationMinutes > 0
      ? {
          label: "Duration",
          value:
            durations.join(" or ") ||
            `${Math.round(experience.durationMinutes / 60)} hours`
        }
      : null,
    experience.baseCapacity > 0
      ? { label: "Group Size", value: `1 – ${experience.baseCapacity} people` }
      : null,
    languages ? { label: "Languages", value: languages } : null,
    meetingPoint ? { label: "Meeting Point", value: meetingPoint } : null,
    experience.availabilitySummary
      ? { label: "Availability", value: experience.availabilitySummary }
      : null,
    mobileTicketPolicy
      ? {
          label: mobileTicketPolicy.title,
          value: mobileTicketPolicy.description ?? "Yes"
        }
      : null,
    confirmationPolicy
      ? {
          label: confirmationPolicy.title,
          value: confirmationPolicy.description ?? "Yes"
        }
      : null
  ].filter((row): row is { label: string; value: string } => row !== null);

  if (rows.length === 0) return null;

  return (
    <aside className="xp-quick-info" aria-label="Quick information">
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function DetailTabs({ experience }: DetailTabsProps) {
  const baseId = useId();
  const [active, setActive] = useState<TabId>("overview");

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "location" || TAB_IDS.includes(hash as TabId)) {
        setActive(hash === "location" ? "location" : (hash as TabId));
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "included", label: "What's Included" },
    { id: "itinerary", label: "Itinerary" },
    { id: "info", label: "Important Info" },
    {
      id: "reviews",
      label:
        experience.reviews.reviewCount > 0
          ? `Reviews (${experience.reviews.reviewCount})`
          : "Reviews"
    },
    { id: "location", label: "Location" }
  ];

  return (
    <div className="xp-tabs">
      <div
        className="xp-tablist"
        role="tablist"
        aria-label="Experience details"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              className={selected ? "is-active" : undefined}
              onClick={() => {
                setActive(tab.id);
                if (tab.id === "location") {
                  window.history.replaceState(null, "", "#location");
                } else if (window.location.hash === "#location") {
                  window.history.replaceState(
                    null,
                    "",
                    window.location.pathname
                  );
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-${active}`}
        className="xp-tab-panel"
      >
        {active === "overview" ? (
          <div className="xp-overview-grid">
            <div>
              <h2>About This Experience</h2>
              {experience.description ? (
                experience.description
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))
              ) : experience.shortDescription ? (
                <p>{experience.shortDescription}</p>
              ) : null}
              {experience.highlights.length > 0 ? (
                <ul className="xp-checklist">
                  {experience.highlights.slice(0, 3).map((item) => (
                    <li key={item}>
                      <Check size={18} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <QuickInfo experience={experience} />
          </div>
        ) : null}

        {active === "included" ? (
          <div>
            <h2>What&apos;s Included</h2>
            {experience.inclusions.length > 0 ? (
              <ul className="xp-checklist">
                {experience.inclusions.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {active === "itinerary" ? (
          <div>
            <h2>Itinerary</h2>
            {experience.itinerary.length > 0 ? (
              <ol className="xp-itinerary">
                {experience.itinerary.map((step) => (
                  <li key={step.id}>
                    <strong>{step.title}</strong>
                    {step.description ? <p>{step.description}</p> : null}
                    {typeof step.durationMinutes === "number" ? (
                      <span>{step.durationMinutes} minutes</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}

        {active === "info" ? (
          <div>
            <h2>Important Info</h2>
            {experience.requirements.length > 0 ||
            experience.policies.length > 0 ? (
              <div className="xp-info-stacks">
                {experience.requirements.map((requirement) => (
                  <article key={requirement.id}>
                    <h3>{requirement.title}</h3>
                    {requirement.description ? (
                      <p>{requirement.description}</p>
                    ) : null}
                  </article>
                ))}
                {experience.policies.map((policy) => (
                  <article key={policy.id}>
                    <h3>{policy.title}</h3>
                    {policy.description ? <p>{policy.description}</p> : null}
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {active === "reviews" ? (
          <div>
            <h2>Reviews</h2>
            {experience.reviews.reviewCount > 0 ? (
              <>
                <RatingStars
                  rating={experience.reviews.averageRating ?? 0}
                  reviewCount={experience.reviews.reviewCount}
                />
                <ul className="xp-review-list">
                  {experience.reviews.items.map((review) => (
                    <li key={review.id}>
                      <strong>{review.title ?? `${review.rating}/5`}</strong>
                      {review.comment ? <p>{review.comment}</p> : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        {active === "location" ? (
          <div id="location">
            <h2>Location</h2>
            {experience.locations.length > 0 ? (
              <ul className="xp-location-list">
                {experience.locations.map((location) => (
                  <li key={location.id}>
                    <strong>{location.name}</strong>
                    {location.meetingInstructions ? (
                      <p>{location.meetingInstructions}</p>
                    ) : null}
                    {location.city ? <span>{location.city}</span> : null}
                  </li>
                ))}
              </ul>
            ) : experience.locationName ? (
              <p>{experience.locationName}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
