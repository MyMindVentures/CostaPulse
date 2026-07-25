import Link from "next/link";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listAdminBookingStories } from "@/server/repositories/admin-booking-stories";
import { BookingStoryStatusBadge } from "./booking-story-status-badge";
import { CreateBookingStoryButton } from "./create-booking-story-button";

type Query = {
  status: "eligible" | "draft" | "published" | "archived";
  search?: string | null;
  experienceId?: string | null;
  consent?: "pending" | "granted" | "revoked" | null;
  page: number;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

export async function AdminBookingStoriesFeature({ query }: { query: Query }) {
  let result;
  try {
    result = await listAdminBookingStories(query);
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Booking stories could not be loaded</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }
  const pageCount = Math.max(Math.ceil(result.total / result.pageSize), 1);
  const link = (patch: Partial<Query>) => {
    const next = { ...query, ...patch };
    const params = new URLSearchParams({
      status: next.status,
      page: String(next.page)
    });
    if (next.search) params.set("search", next.search);
    if (next.experienceId) params.set("experience_id", next.experienceId);
    if (next.consent) params.set("consent", next.consent);
    return `/admin/booking-stories?${params}`;
  };
  return (
    <section className="flex flex-col gap-6">
      <header>
        <SectionKicker>Content</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Booking Stories
        </h1>
        <p className="text-muted mt-2 max-w-2xl">
          Curate consented footage from completed bookings for Previous
          Adventures.
        </p>
      </header>

      <nav
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Story status"
      >
        {(["eligible", "draft", "published", "archived"] as const).map(
          (status) => (
            <Link
              key={status}
              href={link({ status, page: 1, consent: null })}
              aria-current={query.status === status ? "page" : undefined}
              className={`rounded-[var(--radius)] border p-4 ${
                query.status === status
                  ? "border-turquoise bg-turquoise/5"
                  : "border-border bg-white"
              }`}
            >
              <span className="text-muted block text-sm capitalize">
                {status}
              </span>
              <strong className="text-ink text-2xl">
                {result.counts[status]}
              </strong>
            </Link>
          )
        )}
      </nav>

      <form className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-4 md:grid-cols-4">
        <input type="hidden" name="status" value={query.status} />
        <input
          name="search"
          defaultValue={query.search ?? ""}
          placeholder="Story title or public guest name"
          className="border-input min-h-11 rounded-md border px-3 md:col-span-2"
        />
        <select
          name="experience_id"
          defaultValue={query.experienceId ?? ""}
          className="border-input min-h-11 rounded-md border px-3"
          aria-label="Experience"
        >
          <option value="">All experiences</option>
          {result.experiences.map((experience) => (
            <option key={experience.id} value={experience.id}>
              {experience.title}
            </option>
          ))}
        </select>
        <select
          name="consent"
          defaultValue={query.consent ?? ""}
          disabled={query.status === "eligible"}
          className="border-input min-h-11 rounded-md border px-3 disabled:opacity-50"
          aria-label="Consent"
        >
          <option value="">All consent states</option>
          <option value="pending">Pending</option>
          <option value="granted">Granted</option>
          <option value="revoked">Revoked</option>
        </select>
        <button className="button button-coral min-h-11 justify-self-start">
          Apply filters
        </button>
      </form>

      {result.items.length === 0 ? (
        <div className="border-border rounded-[var(--radius)] border bg-white p-8 text-center">
          <h2 className="text-ink text-lg font-semibold">No stories found</h2>
          <p className="text-muted mt-2">
            This view truthfully reflects the current booking-story data.
          </p>
        </div>
      ) : (
        <div className="border-border overflow-x-auto rounded-[var(--radius)] border bg-white">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="bg-panel text-muted border-b">
              <tr>
                <th className="px-4 py-3">Story</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Booking date</th>
                <th className="px-4 py-3">Public guest</th>
                <th className="px-4 py-3">Media</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-border border-b last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {item.title ?? "Not created"}
                    {item.isFeatured ? (
                      <span className="text-gold ml-2">Featured</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{item.experienceTitle}</td>
                  <td className="px-4 py-3">{formatDate(item.bookingDate)}</td>
                  <td className="px-4 py-3">
                    {item.guestDisplayName ?? "Not set"}
                  </td>
                  <td className="px-4 py-3">{item.mediaCount}</td>
                  <td className="px-4 py-3 capitalize">{item.consentStatus}</td>
                  <td className="px-4 py-3">
                    <BookingStoryStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3">
                    {item.kind === "eligible" ? (
                      <CreateBookingStoryButton bookingId={item.bookingId} />
                    ) : (
                      <Link
                        href={`/admin/booking-stories/${item.id}`}
                        className="button button-outline min-h-11"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <nav className="flex items-center gap-3" aria-label="Pagination">
          <span className="text-muted text-sm">
            Page {result.page} of {pageCount}
          </span>
          {result.page > 1 ? (
            <Link
              className="button button-outline"
              href={link({ page: result.page - 1 })}
            >
              Previous
            </Link>
          ) : null}
          {result.page < pageCount ? (
            <Link
              className="button button-outline"
              href={link({ page: result.page + 1 })}
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
