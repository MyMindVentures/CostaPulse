-- RLS expressions run as the invoking role. private.has_role is SECURITY DEFINER
-- and must be executable by anon/authenticated so published catalog reads work.
-- Clients cannot read other users' roles because the function always uses auth.uid().

GRANT EXECUTE ON FUNCTION private.has_role(public.app_role[]) TO anon, authenticated;

-- Split published vs privileged access so the public path does not depend on has_role.
DROP POLICY IF EXISTS "experiences_public_or_privileged_select" ON public.experiences;

CREATE POLICY "experiences_published_select"
ON public.experiences
FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "experiences_privileged_select"
ON public.experiences
FOR SELECT
TO authenticated
USING (
  provider_profile_id = auth.uid()
  OR private.has_role(
    ARRAY[
      'experience_provider'::public.app_role,
      'operations_staff'::public.app_role,
      'content_manager'::public.app_role,
      'administrator'::public.app_role,
      'super_administrator'::public.app_role
    ]
  )
);

DROP POLICY IF EXISTS "experience_variants_public_or_privileged_select"
ON public.experience_variants;

CREATE POLICY "experience_variants_published_select"
ON public.experience_variants
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experiences
    WHERE experiences.id = experience_variants.experience_id
      AND experiences.status = 'published'
  )
);

CREATE POLICY "experience_variants_privileged_select"
ON public.experience_variants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experiences
    WHERE experiences.id = experience_variants.experience_id
      AND (
        experiences.provider_profile_id = auth.uid()
        OR private.has_role(
          ARRAY[
            'experience_provider'::public.app_role,
            'operations_staff'::public.app_role,
            'content_manager'::public.app_role,
            'administrator'::public.app_role,
            'super_administrator'::public.app_role
          ]
        )
      )
  )
);
