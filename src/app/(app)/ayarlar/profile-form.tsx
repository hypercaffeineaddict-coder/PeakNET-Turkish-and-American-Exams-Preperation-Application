"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  Check,
  User,
  GraduationCap,
  Target,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "./actions";
import { universities } from "@/data/universities";
import { departments } from "@/data/departments";
import { selfSubjects, EXTRA_EXAMS } from "@/data/exam-subjects";
import type { getDict } from "@/lib/i18n";

type ProfileFormLabels = ReturnType<typeof getDict>["profileForm"];
type GradeOption = { value: number; label: string };
type TrackOption = { value: string; label: string };

const goals = [30, 60, 120, 180, 300];

type Profile = {
  display_name: string;
  grade: number | null;
  high_school_track: string | null;
  is_exam_student: boolean;
  target_university: string;
  target_department: string;
  daily_goal_minutes: number;
  strong_subjects: string[];
  weak_subjects: string[];
  extra_exams: string[];
};

export function ProfileForm({
  profile,
  email,
  labels,
  grades,
  tracks,
}: {
  profile: Profile;
  email: string;
  labels: ProfileFormLabels;
  grades: GradeOption[];
  tracks: TrackOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<string>(profile.high_school_track ?? "MF");
  const subjects = selfSubjects(track);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setError(null);
          const res = await updateProfile(fd);
          if (res?.error) {
            setError(res.error);
            toast.error(res.error);
          } else {
            setSavedAt(Date.now());
            toast.success(labels.toastSuccess);
          }
        })
      }
      className="space-y-6"
    >
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <User size={16} className="text-primary" />
          {labels.title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {labels.emailPrefix}
          {email}
        </p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-muted-foreground">{labels.nameLabel}</span>
            <input
              name="display_name"
              required
              defaultValue={profile.display_name}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap size={16} className="text-primary" />
          {labels.sectionGradeTrack}
        </h2>
        <div>
          <span className="text-xs text-muted-foreground">{labels.gradeLabel}</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {grades.map((g) => (
              <label
                key={g.value}
                className="cursor-pointer rounded-full border border-border bg-background px-4 py-1.5 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
              >
                <input
                  type="radio"
                  name="grade"
                  value={g.value}
                  className="hidden"
                  defaultChecked={profile.grade === g.value}
                />
                {g.label}
              </label>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/5">
          <input
            type="checkbox"
            name="is_exam_student"
            defaultChecked={profile.is_exam_student}
            className="mt-0.5 accent-orange-500"
          />
          <div className="text-sm">
            <div className="font-medium">{labels.examStudentLabel}</div>
            <div className="text-xs text-muted-foreground">
              {labels.examStudentShort}
            </div>
          </div>
        </label>
        <div>
          <span className="text-xs text-muted-foreground">{labels.trackLabel}</span>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {tracks.map((t) => (
              <label
                key={t.value}
                className="cursor-pointer rounded-xl border border-border bg-background p-2.5 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="high_school_track"
                  value={t.value}
                  className="hidden"
                  checked={track === t.value}
                  onChange={() => setTrack(t.value)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Award size={16} className="text-primary" />
          {labels.extraExamsTitle}
        </h2>
        <p className="text-xs text-muted-foreground">{labels.extraExamsDesc}</p>
        <div className="flex flex-col gap-2">
          {EXTRA_EXAMS.map((e) => (
            <label
              key={e.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="checkbox"
                name="extra_exams"
                value={e.id}
                defaultChecked={profile.extra_exams?.includes(e.id)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <div className="text-sm">
                <div className="font-medium">{e.label}</div>
                <div className="text-xs text-muted-foreground">{e.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Target size={16} className="text-primary" />
          {labels.targetTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted-foreground">{labels.universityLabel}</span>
            <input
              name="target_university"
              list="university-list"
              defaultValue={profile.target_university}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            <datalist id="university-list">
              {universities.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">{labels.departmentLabel}</span>
            <input
              name="target_department"
              list="department-list"
              placeholder={labels.departmentPlaceholder}
              defaultValue={profile.target_department}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            <datalist id="department-list">
              {departments.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock size={16} className="text-primary" />
          {labels.dailyGoalTitle}
        </h2>
        <div className="flex flex-wrap gap-2">
          {goals.map((g) => (
            <label
              key={g}
              className="cursor-pointer rounded-full border border-border bg-background px-4 py-1.5 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
            >
              <input
                type="radio"
                name="daily_goal_minutes"
                value={g}
                className="hidden"
                defaultChecked={profile.daily_goal_minutes === g}
              />
              {g} {labels.minutesUnit}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-primary" />
          {labels.subjectsTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-500">
              {labels.strongHeader}
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="cursor-pointer rounded-full border border-border bg-background px-3 py-1 text-sm transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-emerald-500"
                >
                  <input
                    type="checkbox"
                    name="strong"
                    value={s.id}
                    defaultChecked={profile.strong_subjects.includes(s.id)}
                    className="hidden"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-500">
              {labels.weakHeader}
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="cursor-pointer rounded-full border border-border bg-background px-3 py-1 text-sm transition has-[:checked]:border-rose-500 has-[:checked]:bg-rose-500/10 has-[:checked]:text-rose-500"
                >
                  <input
                    type="checkbox"
                    name="weak"
                    value={s.id}
                    defaultChecked={profile.weak_subjects.includes(s.id)}
                    className="hidden"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {savedAt && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-500">
            <Check size={14} /> {labels.saved}
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {labels.submit}
        </button>
      </div>
    </form>
  );
}
