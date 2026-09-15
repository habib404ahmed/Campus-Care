-- ============================================================
-- Campus Care — 012_rls_policies.sql
-- Comprehensive Row Level Security (RLS) policies for all system tables
-- ============================================================

-- ── Helper Security Functions ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_worker_dept()
RETURNS TEXT AS $$
  SELECT worker_department FROM public.profiles
  WHERE id = auth.uid() AND role = 'worker' AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ── 1. campus_locations RLS ───────────────────────────────────
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Locations viewable by authenticated users" ON public.campus_locations;
CREATE POLICY "Locations viewable by authenticated users"
  ON public.campus_locations FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Locations manageable by admins" ON public.campus_locations;
CREATE POLICY "Locations manageable by admins"
  ON public.campus_locations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── 2. emergency_incidents RLS ────────────────────────────────
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;

-- Reporter can view own emergency; workers view emergencies matching their department or SOS; admins view all
DROP POLICY IF EXISTS "Emergency select policy" ON public.emergency_incidents;
CREATE POLICY "Emergency select policy"
  ON public.emergency_incidents FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR public.is_admin()
    OR (
      public.get_user_role() = 'worker' AND (
        incident_type = 'sos'
        OR (incident_type = 'medical' AND public.get_worker_dept() = 'medical')
        OR (incident_type = 'fire' AND public.get_worker_dept() = 'fire')
        OR (incident_type = 'security' AND public.get_worker_dept() = 'security')
        OR incident_type = 'other'
      )
    )
  );

-- Any authenticated user can report an emergency for themselves
DROP POLICY IF EXISTS "Emergency insert policy" ON public.emergency_incidents;
CREATE POLICY "Emergency insert policy"
  ON public.emergency_incidents FOR INSERT
  TO authenticated
  WITH CHECK (
    reported_by = auth.uid()
    AND status = 'pending'
  );

-- Reporters can cancel/update description while pending; Workers and Admins can update status/priority/resolved_at
DROP POLICY IF EXISTS "Emergency update policy" ON public.emergency_incidents;
CREATE POLICY "Emergency update policy"
  ON public.emergency_incidents FOR UPDATE
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR public.is_admin()
    OR public.get_user_role() = 'worker'
  )
  WITH CHECK (
    -- If normal user, only allow updating own pending incident without elevating status to resolved
    (
      reported_by = auth.uid()
      AND (OLD.status = 'pending' AND NEW.status IN ('pending', 'cancelled'))
    )
    OR public.is_admin()
    OR public.get_user_role() = 'worker'
  );


-- ── 3. medical_incidents RLS ──────────────────────────────────
ALTER TABLE public.medical_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Medical select policy" ON public.medical_incidents;
CREATE POLICY "Medical select policy"
  ON public.medical_incidents FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR public.is_admin()
    OR public.get_worker_dept() = 'medical'
  );

DROP POLICY IF EXISTS "Medical insert policy" ON public.medical_incidents;
CREATE POLICY "Medical insert policy"
  ON public.medical_incidents FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "Medical update policy" ON public.medical_incidents;
CREATE POLICY "Medical update policy"
  ON public.medical_incidents FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.get_worker_dept() = 'medical')
  WITH CHECK (public.is_admin() OR public.get_worker_dept() = 'medical');


-- ── 4. fire_incidents RLS ─────────────────────────────────────
ALTER TABLE public.fire_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fire select policy" ON public.fire_incidents;
CREATE POLICY "Fire select policy"
  ON public.fire_incidents FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR public.is_admin()
    OR public.get_worker_dept() = 'fire'
  );

DROP POLICY IF EXISTS "Fire insert policy" ON public.fire_incidents;
CREATE POLICY "Fire insert policy"
  ON public.fire_incidents FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "Fire update policy" ON public.fire_incidents;
CREATE POLICY "Fire update policy"
  ON public.fire_incidents FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.get_worker_dept() = 'fire')
  WITH CHECK (public.is_admin() OR public.get_worker_dept() = 'fire');


-- ── 5. security_reports RLS ───────────────────────────────────
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Security reports select policy" ON public.security_reports;
CREATE POLICY "Security reports select policy"
  ON public.security_reports FOR SELECT
  TO authenticated
  USING (
    reported_by = auth.uid()
    OR public.is_admin()
    OR public.get_worker_dept() = 'security'
  );

DROP POLICY IF EXISTS "Security reports insert policy" ON public.security_reports;
CREATE POLICY "Security reports insert policy"
  ON public.security_reports FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "Security reports update policy" ON public.security_reports;
CREATE POLICY "Security reports update policy"
  ON public.security_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.get_worker_dept() = 'security')
  WITH CHECK (public.is_admin() OR public.get_worker_dept() = 'security');


-- ── 6. unsafe_locations RLS ───────────────────────────────────
ALTER TABLE public.unsafe_locations ENABLE ROW LEVEL SECURITY;

-- Verified and active hazard markers visible on campus map to all authenticated users
DROP POLICY IF EXISTS "Unsafe locations select policy" ON public.unsafe_locations;
CREATE POLICY "Unsafe locations select policy"
  ON public.unsafe_locations FOR SELECT
  TO authenticated
  USING (
    status IN ('under_review', 'verified', 'resolved')
    OR reported_by = auth.uid()
    OR public.is_admin()
    OR public.get_worker_dept() = 'security'
  );

DROP POLICY IF EXISTS "Unsafe locations insert policy" ON public.unsafe_locations;
CREATE POLICY "Unsafe locations insert policy"
  ON public.unsafe_locations FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "Unsafe locations update policy" ON public.unsafe_locations;
CREATE POLICY "Unsafe locations update policy"
  ON public.unsafe_locations FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.get_worker_dept() = 'security')
  WITH CHECK (public.is_admin() OR public.get_worker_dept() = 'security');


-- ── 7. rides RLS ──────────────────────────────────────────────
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- Active and open rides visible to all authenticated campus community members
DROP POLICY IF EXISTS "Rides select policy" ON public.rides;
CREATE POLICY "Rides select policy"
  ON public.rides FOR SELECT
  TO authenticated
  USING (
    status IN ('open', 'full', 'started', 'completed')
    OR created_by = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Rides insert policy" ON public.rides;
CREATE POLICY "Rides insert policy"
  ON public.rides FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND public.get_user_role() IN ('student', 'teacher', 'faculty', 'worker')
  );

DROP POLICY IF EXISTS "Rides update policy" ON public.rides;
CREATE POLICY "Rides update policy"
  ON public.rides FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Rides delete policy" ON public.rides;
CREATE POLICY "Rides delete policy"
  ON public.rides FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin());


-- ── 8. ride_requests RLS ──────────────────────────────────────
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ride requests select policy" ON public.ride_requests;
CREATE POLICY "Ride requests select policy"
  ON public.ride_requests FOR SELECT
  TO authenticated
  USING (
    requester_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND created_by = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Ride requests insert policy" ON public.ride_requests;
CREATE POLICY "Ride requests insert policy"
  ON public.ride_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Ride requests update policy" ON public.ride_requests;
CREATE POLICY "Ride requests update policy"
  ON public.ride_requests FOR UPDATE
  TO authenticated
  USING (
    requester_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND created_by = auth.uid()
    )
    OR public.is_admin()
  )
  WITH CHECK (
    -- Requester can only cancel their own request
    (requester_id = auth.uid() AND NEW.status = 'cancelled')
    -- Ride creator can accept/reject/complete
    OR EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND created_by = auth.uid()
    )
    OR public.is_admin()
  );


-- ── 9. lost_found_items RLS ───────────────────────────────────
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lost and found select policy" ON public.lost_found_items;
CREATE POLICY "Lost and found select policy"
  ON public.lost_found_items FOR SELECT
  TO authenticated
  USING (
    status IN ('lost', 'found', 'claimed')
    OR reported_by = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Lost and found insert policy" ON public.lost_found_items;
CREATE POLICY "Lost and found insert policy"
  ON public.lost_found_items FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS "Lost and found update policy" ON public.lost_found_items;
CREATE POLICY "Lost and found update policy"
  ON public.lost_found_items FOR UPDATE
  TO authenticated
  USING (reported_by = auth.uid() OR public.is_admin())
  WITH CHECK (reported_by = auth.uid() OR public.is_admin());


-- ── 10. lost_found_location_updates RLS ───────────────────────
ALTER TABLE public.lost_found_location_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lost found updates select policy" ON public.lost_found_location_updates;
CREATE POLICY "Lost found updates select policy"
  ON public.lost_found_location_updates FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Lost found updates insert policy" ON public.lost_found_location_updates;
CREATE POLICY "Lost found updates insert policy"
  ON public.lost_found_location_updates FOR INSERT
  TO authenticated
  WITH CHECK (updated_by = auth.uid());


-- ── 11. notifications RLS ─────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipients can read only their own notifications
DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
CREATE POLICY "Notifications select policy"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Recipients can mark only their own notifications as read
DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;
CREATE POLICY "Notifications update policy"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insertion restricted to admins or service role to avoid client spam
DROP POLICY IF EXISTS "Notifications insert policy" ON public.notifications;
CREATE POLICY "Notifications insert policy"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- ── 12. worker_status RLS ─────────────────────────────────────
ALTER TABLE public.worker_status ENABLE ROW LEVEL SECURITY;

-- All workers and admins can view on-duty worker availability
DROP POLICY IF EXISTS "Worker status select policy" ON public.worker_status;
CREATE POLICY "Worker status select policy"
  ON public.worker_status FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'worker' OR public.is_admin());

-- Workers can insert/update only their own status record
DROP POLICY IF EXISTS "Worker status insert policy" ON public.worker_status;
CREATE POLICY "Worker status insert policy"
  ON public.worker_status FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id = auth.uid()
    AND public.get_user_role() = 'worker'
  );

DROP POLICY IF EXISTS "Worker status update policy" ON public.worker_status;
CREATE POLICY "Worker status update policy"
  ON public.worker_status FOR UPDATE
  TO authenticated
  USING (
    (worker_id = auth.uid() AND public.get_user_role() = 'worker')
    OR public.is_admin()
  )
  WITH CHECK (
    (worker_id = auth.uid() AND public.get_user_role() = 'worker')
    OR public.is_admin()
  );


-- ── 13. incident_assignments RLS ──────────────────────────────
ALTER TABLE public.incident_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assignments select policy" ON public.incident_assignments;
CREATE POLICY "Assignments select policy"
  ON public.incident_assignments FOR SELECT
  TO authenticated
  USING (
    worker_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Assignments insert policy" ON public.incident_assignments;
CREATE POLICY "Assignments insert policy"
  ON public.incident_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Assignments update policy" ON public.incident_assignments;
CREATE POLICY "Assignments update policy"
  ON public.incident_assignments FOR UPDATE
  TO authenticated
  USING (worker_id = auth.uid() OR public.is_admin())
  WITH CHECK (
    (worker_id = auth.uid() AND NEW.status IN ('accepted', 'in_progress', 'completed', 'declined'))
    OR public.is_admin()
  );


-- ── 14. audit_logs RLS ────────────────────────────────────────
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Sensitive audit records accessible exclusively to administrators
DROP POLICY IF EXISTS "Audit logs select policy" ON public.audit_logs;
CREATE POLICY "Audit logs select policy"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Insertion allowed for authenticated actions by their respective actor or admin
DROP POLICY IF EXISTS "Audit logs insert policy" ON public.audit_logs;
CREATE POLICY "Audit logs insert policy"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    OR public.is_admin()
  );

-- Immutable audit logs: No updates or deletes allowed
