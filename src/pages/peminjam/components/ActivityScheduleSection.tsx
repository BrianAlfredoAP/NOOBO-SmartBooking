
import { useState } from "react";

export const ActivityScheduleSection = () => {
  const [activityDate, setActivityDate] = useState("12 Desember 2026");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("16:00");

  return (
    <section
      aria-labelledby="activity-schedule-title"
      className="absolute left-0 top-[690px] flex w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
    >
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2
            id="activity-schedule-title"
            className="text-sm font-bold leading-5 text-slate-900"
          >
            Jadwal Kegiatan
          </h2>
          <p className="text-xs leading-4 text-slate-500">
            Pilih tanggal dan waktu kegiatan.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="activity-date"
          className="text-xs font-semibold leading-4 text-slate-700"
        >
          Tanggal Kegiatan
        </label>
        <div className="flex h-[54px] items-center gap-3 rounded-xl border border-slate-200 bg-transparent px-3.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          <input
            id="activity-date"
            name="activityDate"
            type="text"
            value={activityDate}
            onChange={(event) => setActivityDate(event.target.value)}
            className="w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="startTime"
            className="text-xs font-semibold leading-4 text-slate-700"
          >
            Waktu Mulai
          </label>
          <div className="flex h-[54px] min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <select
              id="startTime"
              name="startTime"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full min-w-0 appearance-none bg-transparent text-sm text-slate-800 outline-none"
            >
              {Array.from({ length: 24 }, (_, hour) =>
                ["00", "30"].map((minute) => {
                  const value = `${String(hour).padStart(2, "0")}:${minute}`;
                  return (
                    <option key={value} value={value}>
                      {value.replace(":", ".")}
                    </option>
                  );
                }),
              )}
            </select>
            <span className="shrink-0 text-xs text-slate-400">⌄</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="endTime"
            className="text-xs font-semibold leading-4 text-slate-700"
          >
            Waktu Selesai
          </label>
          <div className="flex h-[54px] min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <select
              id="endTime"
              name="endTime"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="w-full min-w-0 appearance-none bg-transparent text-sm text-slate-800 outline-none"
            >
              {Array.from({ length: 24 }, (_, hour) =>
                ["00", "30"].map((minute) => {
                  const value = `${String(hour).padStart(2, "0")}:${minute}`;
                  return (
                    <option key={value} value={value}>
                      {value.replace(":", ".")}
                    </option>
                  );
                }),
              )}
            </select>
            <span className="shrink-0 text-xs text-slate-400">⌄</span>
          </div>
        </div>
      </div>
    </section>
  );
};
