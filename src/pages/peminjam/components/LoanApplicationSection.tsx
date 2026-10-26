
import type { ReactElement } from "react";

const steps = [
  { number: "1", label: <>Data &amp;<br />Kebutuhan</>, active: true },
  { number: "2", label: <>Rekomendasi</>, active: false },
  { number: "3", label: <>Dokumen &amp;<br />Pembina</>, active: false },
  { number: "4", label: <>Konfirmasi</>, active: false },
];

export const LoanApplicationSection = (): ReactElement => {
  return (
    <nav
      className="relative z-10 w-full bg-white px-5 pt-2 pb-3"
      aria-label="Tahapan pengajuan peminjaman"
    >
      <div className="relative grid grid-cols-4">
        {/* Garis penghubung */}
        <div
          className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-rose-100"
          aria-hidden="true"
        />
        <div
          className="absolute left-[12.5%] top-4 h-px bg-sky-500"
          style={{ width: "25%" }}
          aria-hidden="true"
        />

        {/* Nomor tahapan */}
        {steps.map((step) => (
          <div key={step.number} className="relative flex justify-center">
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step.active
                  ? "bg-sky-500 text-white"
                  : "bg-rose-50 text-neutral-400"
              }`}
              aria-current={step.active ? "step" : undefined}
            >
              {step.number}
            </span>
          </div>
        ))}
      </div>

      {/* Label tepat di bawah nomor */}
      <div className="mt-2 grid grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex min-w-0 justify-center text-center text-[10px] leading-3 ${
              step.active ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <span className="w-full px-0.5">{step.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
};
