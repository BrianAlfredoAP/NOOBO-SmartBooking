
import type { ReactElement } from "react";
import { ActivityInformationSection } from "./ActivityInformationSection";
import { ActivityScheduleSection } from "./ActivityScheduleSection";
import { AdditionalInformationSection } from "./AdditionalInformationSection";
import { BorrowingSection } from "./BorrowingSection";
import { LoanApplicationSection } from "../../components/LoanApplicationSection";
import { RequiredFacilitiesSection } from "./RequiredFacilitiesSection";

export const Fsk = (): ReactElement => {
  return (
    <main className="relative mx-auto flex h-[100dvh] min-h-0 w-full max-w-[430px] flex-col overflow-hidden bg-white">

      {/* Header pengajuan */}
      <header className="z-20 shrink-0 bg-white">

        {/* Judul dan tombol kembali */}
        <div className="relative flex h-[112px] items-center justify-center px-12">
          <button
            type="button"
            aria-label="Kembali"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-800"
          >
            ←
          </button>

          <h1 className="text-center text-base font-bold text-black">
            Ajukan Peminjaman
          </h1>
        </div>

        {/* Nomor tahapan */}
      </header>

      {/* Formulir scroll */}
      <div
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-4"
        role="region"
        aria-label="Formulir pengajuan peminjaman"
      >
        <LoanApplicationSection />
        
        <div className="flex w-full flex-col gap-4">
          <BorrowingSection />
          <ActivityInformationSection />
          <RequiredFacilitiesSection />
          <ActivityScheduleSection />
          <AdditionalInformationSection />
        </div>
      </div>

      {/* Tombol bawah */}
      <footer className="z-50 shrink-0 border-t border-slate-100 bg-white px-5 pb-5 pt-3">
        <button
          type="button"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-[0px_4px_10px_rgba(37,99,235,0.25)] transition-colors hover:bg-blue-700"
          aria-label="Lanjut ke langkah berikutnya"
        >
          Lanjut
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </footer>
    </main>
  );
};
