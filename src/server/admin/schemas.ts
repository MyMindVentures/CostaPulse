import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "draft",
  "pending_payment",
  "payment_processing",
  "confirmed",
  "pending_manual_confirmation",
  "cancelled",
  "completed",
  "refunded",
  "partially_refunded",
  "no_show"
]);

export const paymentStatusSchema = z.enum([
  "unpaid",
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "partially_refunded"
]);

export const availabilityStatusSchema = z.enum([
  "scheduled",
  "sold_out",
  "unavailable",
  "cancelled",
  "completed"
]);

/** Accept Postgres timestamptz strings without enforcing a strict ISO profile. */
const isoDateTimeSchema = z.string().min(1);

export const adminDashboardOverviewSchema = z.object({
  period: z.object({
    from: isoDateTimeSchema.nullable().optional(),
    to: isoDateTimeSchema.nullable().optional()
  }),
  bookings_total: z.coerce.number().int().nonnegative(),
  bookings_confirmed: z.coerce.number().int().nonnegative(),
  pending_manual_confirmation: z.coerce.number().int().nonnegative(),
  paid_revenue_minor: z.coerce.number().int(),
  refunds_minor: z.coerce.number().int(),
  upcoming_slots: z.coerce.number().int().nonnegative(),
  failed_payments: z.coerce.number().int().nonnegative(),
  customers_total: z.coerce.number().int().nonnegative(),
  partners_active: z.coerce.number().int().nonnegative(),
  reviews_pending: z.coerce.number().int().nonnegative()
});

export type AdminDashboardOverview = z.infer<
  typeof adminDashboardOverviewSchema
>;

export const adminBookingListItemSchema = z
  .object({
    id: z.string().uuid(),
    booking_reference: z.string(),
    status: bookingStatusSchema,
    payment_status: paymentStatusSchema,
    customer_email: z.string().nullable().optional(),
    contact_first_name: z.string().nullable().optional(),
    contact_last_name: z.string().nullable().optional(),
    customer_phone: z.string().nullable().optional(),
    party_size: z.coerce.number().int().nonnegative(),
    currency: z.string(),
    total_amount_minor: z.coerce.number().int(),
    voucher_amount_minor: z.coerce.number().int().nullable().optional(),
    source_channel: z.string().nullable().optional(),
    starts_at_snapshot: isoDateTimeSchema.nullable().optional(),
    ends_at_snapshot: isoDateTimeSchema.nullable().optional(),
    timezone_snapshot: z.string().nullable().optional(),
    experience_title_snapshot: z.string().nullable().optional(),
    variant_name_snapshot: z.string().nullable().optional(),
    location_name_snapshot: z.string().nullable().optional(),
    special_requests: z.string().nullable().optional(),
    created_at: isoDateTimeSchema,
    updated_at: isoDateTimeSchema.nullable().optional(),
    booked_at: isoDateTimeSchema.nullable().optional(),
    confirmed_at: isoDateTimeSchema.nullable().optional(),
    experience_id: z.string().uuid().nullable().optional(),
    experience_variant_id: z.string().uuid().nullable().optional(),
    availability_slot_id: z.string().uuid().nullable().optional(),
    customer_id: z.string().uuid().nullable().optional(),
    partner_id: z.string().uuid().nullable().optional(),
    partner_name: z.string().nullable().optional(),
    current_location_name: z.string().nullable().optional()
  })
  .passthrough();

export type AdminBookingListItem = z.infer<typeof adminBookingListItemSchema>;

export const adminPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.coerce.number().int().positive(),
    page_size: z.coerce.number().int().positive(),
    total: z.coerce.number().int().nonnegative(),
    page_count: z.coerce.number().int().nonnegative()
  });

export const adminBookingsPageSchema = adminPaginatedSchema(
  adminBookingListItemSchema
);

export type AdminBookingsPage = z.infer<typeof adminBookingsPageSchema>;

export const adminBookingDetailSchema = adminBookingListItemSchema.extend({
  participants: z.array(z.record(z.string(), z.unknown())).default([]),
  price_lines: z.array(z.record(z.string(), z.unknown())).default([]),
  addons: z.array(z.record(z.string(), z.unknown())).default([]),
  status_history: z.array(z.record(z.string(), z.unknown())).default([]),
  contact_events: z.array(z.record(z.string(), z.unknown())).default([]),
  waivers: z.array(z.record(z.string(), z.unknown())).default([]),
  payment_events: z.array(z.record(z.string(), z.unknown())).default([])
});

export type AdminBookingDetail = z.infer<typeof adminBookingDetailSchema>;

export const adminCustomerListItemSchema = z
  .object({
    id: z.string().uuid(),
    profile_id: z.string().uuid().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    preferred_language: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    lifetime_bookings: z.coerce.number().int().nonnegative().optional(),
    lifetime_spent_minor: z.coerce.number().int().optional(),
    last_booking_at: isoDateTimeSchema.nullable().optional(),
    created_at: isoDateTimeSchema,
    booking_count_current: z.coerce.number().int().nonnegative().optional(),
    paid_total_minor_current: z.coerce.number().int().optional(),
    last_booking_at_current: isoDateTimeSchema.nullable().optional()
  })
  .passthrough();

export type AdminCustomerListItem = z.infer<typeof adminCustomerListItemSchema>;

export const adminCustomersPageSchema = adminPaginatedSchema(
  adminCustomerListItemSchema
);

export type AdminCustomersPage = z.infer<typeof adminCustomersPageSchema>;

export const adminCustomerDetailSchema = adminCustomerListItemSchema.extend({
  bookings: z.array(adminBookingListItemSchema).default([]),
  vouchers: z.array(z.record(z.string(), z.unknown())).default([]),
  reviews: z.array(z.record(z.string(), z.unknown())).default([]),
  notes: z.string().nullable().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional()
});

export type AdminCustomerDetail = z.infer<typeof adminCustomerDetailSchema>;

const assignedTeamMemberSchema = z
  .object({
    team_member_id: z.string().uuid().optional(),
    id: z.string().uuid().optional(),
    display_name: z.string().nullable().optional(),
    role_label: z.string().nullable().optional(),
    is_primary: z.boolean().optional()
  })
  .passthrough();

export const adminCalendarItemSchema = z
  .object({
    availability_slot_id: z.string().uuid(),
    experience_id: z.string().uuid(),
    experience_variant_id: z.string().uuid().nullable().optional(),
    experience_title: z.string().nullable().optional(),
    variant_name: z.string().nullable().optional(),
    starts_at: isoDateTimeSchema,
    ends_at: isoDateTimeSchema,
    timezone: z.string().nullable().optional(),
    status: availabilityStatusSchema,
    capacity_total: z.coerce.number().int().nonnegative(),
    capacity_reserved: z.coerce.number().int().nonnegative(),
    capacity_available: z.coerce.number().int(),
    booking_cutoff_at: isoDateTimeSchema.nullable().optional(),
    is_instant_confirmation: z.boolean().optional(),
    location_id: z.string().uuid().nullable().optional(),
    location_name: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    assigned_team: z
      .preprocess((value) => {
        if (value == null) return [];
        return Array.isArray(value) ? value : [];
      }, z.array(assignedTeamMemberSchema))
      .optional()
  })
  .passthrough();

export type AdminCalendarItem = z.infer<typeof adminCalendarItemSchema>;

export const adminCalendarListSchema = z.array(adminCalendarItemSchema);

export const adminReferenceDataSchema = z
  .object({
    experiences: z.array(
      z
        .object({
          id: z.string().uuid(),
          slug: z.string(),
          title: z.string().optional(),
          name: z.string().optional(),
          status: z.string(),
          experience_type: z.string().nullable().optional(),
          thumbnail: z.string().nullable().optional()
        })
        .passthrough()
        .transform((row) => ({
          ...row,
          title: row.title ?? row.name ?? row.slug
        }))
    ),
    variants: z.array(
      z
        .object({
          id: z.string().uuid(),
          experience_id: z.string().uuid(),
          parent_id: z.string().uuid().optional(),
          name: z.string(),
          slug: z.string(),
          is_active: z.boolean(),
          status: z.string().optional()
        })
        .passthrough()
    ),
    locations: z.array(
      z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          slug: z.string().optional(),
          city: z.string().nullable().optional(),
          is_active: z.boolean(),
          status: z.string().optional()
        })
        .passthrough()
    ),
    team_members: z.array(
      z
        .object({
          id: z.string().uuid(),
          display_name: z.string().optional(),
          name: z.string().optional(),
          slug: z.string().optional(),
          role_title: z.string().nullable().optional(),
          is_active: z.boolean(),
          status: z.string().optional(),
          thumbnail: z.string().nullable().optional()
        })
        .passthrough()
        .transform((row) => ({
          ...row,
          display_name: row.display_name ?? row.name ?? row.slug ?? row.id
        }))
    ),
    partners: z.array(
      z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          slug: z.string().optional(),
          status: z.string(),
          referral_code: z.string().nullable().optional()
        })
        .passthrough()
    ),
    site_content_sections: z
      .array(
        z
          .object({
            id: z.string().uuid(),
            section_key: z.string().optional(),
            slug: z.string().optional(),
            name: z.string().optional(),
            label: z.string().optional(),
            is_active: z.boolean().optional(),
            status: z.string().optional()
          })
          .passthrough()
      )
      .optional()
      .default([]),
    roles: z.array(z.string()).nullable().optional()
  })
  .passthrough();

export type AdminReferenceData = z.infer<typeof adminReferenceDataSchema>;

export const adminBookingRowSchema = z
  .object({
    id: z.string().uuid(),
    status: bookingStatusSchema,
    version: z.coerce.number().int().optional()
  })
  .passthrough();

export const adminSlotRowSchema = z
  .object({
    id: z.string().uuid(),
    experience_id: z.string().uuid(),
    experience_variant_id: z.string().uuid(),
    starts_at: isoDateTimeSchema,
    ends_at: isoDateTimeSchema,
    capacity_total: z.coerce.number().int(),
    status: availabilityStatusSchema
  })
  .passthrough();

export const adminApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional()
});

export class AdminApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

export const publicationStatusSchema = z.enum([
  "draft",
  "published",
  "archived"
]);

export const partnerStatusSchema = z.enum(["draft", "active", "disabled"]);

export const mediaTypeSchema = z.enum([
  "image",
  "video",
  "audio",
  "document",
  "vector",
  "animation",
  "other"
]);

export const mediaAssetStatusSchema = z.enum([
  "draft",
  "published",
  "archived"
]);

export const mediaVisibilitySchema = z.enum([
  "public",
  "authenticated",
  "private"
]);

export const adminExperienceHealthSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    status: publicationStatusSchema,
    experience_type: z.string().nullable().optional(),
    is_featured: z.boolean().optional(),
    sort_order: z.coerce.number().int().optional(),
    variants_count: z.coerce.number().int().nonnegative().optional(),
    media_count: z.coerce.number().int().nonnegative().optional(),
    locations_count: z.coerce.number().int().nonnegative().optional(),
    upcoming_slots_count: z.coerce.number().int().nonnegative().optional(),
    next_slot_at: isoDateTimeSchema.nullable().optional(),
    bookings_count: z.coerce.number().int().nonnegative().optional(),
    paid_revenue_minor: z.coerce.number().int().optional()
  })
  .passthrough();

export type AdminExperienceHealth = z.infer<typeof adminExperienceHealthSchema>;

export const adminExperienceListSchema = z.array(adminExperienceHealthSchema);

export const adminExperienceDetailSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    status: publicationStatusSchema,
    variants: z.array(z.record(z.string(), z.unknown())).default([]),
    media: z.array(z.record(z.string(), z.unknown())).default([]),
    locations: z.array(z.record(z.string(), z.unknown())).default([]),
    itinerary: z.array(z.record(z.string(), z.unknown())).default([]),
    requirements: z.array(z.record(z.string(), z.unknown())).default([]),
    policies: z.array(z.record(z.string(), z.unknown())).default([]),
    languages: z.array(z.record(z.string(), z.unknown())).default([]),
    addons: z.array(z.record(z.string(), z.unknown())).default([]),
    team_members: z.array(z.record(z.string(), z.unknown())).default([])
  })
  .passthrough();

export type AdminExperienceDetail = z.infer<typeof adminExperienceDetailSchema>;

export const adminPartnerSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    referral_code: z.string(),
    status: partnerStatusSchema,
    attribution_window_hours: z.coerce.number().int().positive(),
    voucher_percent_basis_points: z.coerce.number().int().nonnegative(),
    website_url: z.string().nullable().optional(),
    business_type: z.string().nullable().optional(),
    contact_name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    address_line_1: z.string().nullable().optional(),
    address_line_2: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    province: z.string().nullable().optional(),
    country_code: z.string().nullable().optional(),
    owner_profile_id: z.string().uuid().nullable().optional()
  })
  .passthrough();

export type AdminPartner = z.infer<typeof adminPartnerSchema>;

export const adminPartnerDetailSchema = adminPartnerSchema.extend({
  media: z.array(z.record(z.string(), z.unknown())).default([]),
  performance: z.record(z.string(), z.unknown()).nullable().optional()
});

export type AdminPartnerDetail = z.infer<typeof adminPartnerDetailSchema>;

export const adminLocationSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    city: z.string(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    is_active: z.boolean()
  })
  .passthrough();

export type AdminLocation = z.infer<typeof adminLocationSchema>;

export const adminTeamMemberSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    role_title: z.string(),
    is_active: z.boolean(),
    display_order: z.coerce.number().int().optional()
  })
  .passthrough();

export type AdminTeamMember = z.infer<typeof adminTeamMemberSchema>;

export const adminMediaUsedBySchema = z.array(
  z
    .object({
      kind: z.string(),
      label: z.string().optional()
    })
    .passthrough()
);

export const adminMediaAssetSchema = z
  .object({
    id: z.string().uuid(),
    bucket_id: z.string(),
    storage_path: z.string(),
    asset_key: z.string(),
    media_type: z.string(),
    mime_type: z.string().nullable().optional(),
    byte_size: z.coerce.number().int().nullable().optional(),
    title: z.string().nullable().optional(),
    alt_text: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    tags: z.array(z.string()).optional().default([]),
    width: z.coerce.number().int().nullable().optional(),
    height: z.coerce.number().int().nullable().optional(),
    status: mediaAssetStatusSchema.optional(),
    visibility: mediaVisibilitySchema.optional(),
    scope_type: z.string().nullable().optional(),
    scope_key: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    display_order: z.coerce.number().int().optional(),
    is_primary: z.boolean().optional(),
    is_active: z.boolean().optional(),
    used_by: adminMediaUsedBySchema.optional().default([])
  })
  .passthrough();

export type AdminMediaAsset = z.infer<typeof adminMediaAssetSchema>;

export const adminMediaListSchema = z.object({
  items: z.array(adminMediaAssetSchema),
  page: z.coerce.number().int().positive(),
  page_size: z.coerce.number().int().positive(),
  total: z.coerce.number().int().nonnegative()
});

export type AdminMediaList = z.infer<typeof adminMediaListSchema>;

export const signedUploadSchema = z
  .object({
    signedUrl: z.string().optional(),
    signed_url: z.string().optional(),
    path: z.string().optional(),
    token: z.string().optional()
  })
  .passthrough();

export const preparedMediaUploadSchema = z
  .object({
    signedUrl: z.string().optional(),
    signed_url: z.string().optional(),
    token: z.string().optional(),
    bucket: z.string(),
    path: z.string().optional(),
    storage_path: z.string(),
    generated_filename: z.string(),
    folder: z.string().optional(),
    human_label: z.string().optional(),
    original_filename: z.string().optional(),
    mime_type: z.string().optional(),
    entity_type: z.string().optional(),
    entity_id: z.string().uuid().optional(),
    parent_entity_id: z.string().uuid().nullable().optional(),
    usage: z.string().optional()
  })
  .passthrough();

export type PreparedMediaUpload = z.infer<typeof preparedMediaUploadSchema>;

export const finalizedMediaUploadSchema = z
  .object({
    asset: adminMediaAssetSchema,
    placement: z.record(z.string(), z.unknown()),
    used_by: adminMediaUsedBySchema.optional()
  })
  .passthrough();

export type FinalizedMediaUpload = z.infer<typeof finalizedMediaUploadSchema>;
