
import type { ReactElement } from "react";
import { ActivityInformationSection } from "./components/ActivityInformationSection";
import { ActivityScheduleSection } from "./components/ActivityScheduleSection";
import { AdditionalInformationSection } from "./components/AdditionalInformationSection";
import { BorrowingSection } from "./components/BorrowingSection";
import { LoanApplicationSection } from "./components/LoanApplicationSection";
import { RequiredFacilitiesSection } from "./components/RequiredFacilitiesSection";

export const Fsk = (): ReactElement => {
  return (
    <main className="relative min-h-[100dvh] w-full min-w-[390px] bg-white">
      <div
        className="absolute inset-x-0 bottom-[84px] top-0 overflow-x-hidden overflow-y-auto overscroll-contain"
        role="region"
        aria-label="Formulir pengajuan peminjaman"
      >
        <header className="relative h-[145px] w-full bg-white">
          <div className="absolute left-4 top-[50px] flex h-6 w-[calc(100%-32px)] items-center justify-center">
            <span
              aria-label="Kembali"
              className="absolute left-0 flex h-6 w-8 items-center justify-start text-xl leading-none"
            >
              ←
            </span>

            <h1 className="whitespace-nowrap [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] text-base font-bold leading-5 text-black">
              Ajukan Peminjaman
            </h1>
          </div>
        </header>

        <div className="relative -mt-10 w-full">
          <LoanApplicationSection />
        </div>

        <div className="relative mt-[100px] flex flex-col gap-4">
          <BorrowingSection />
          <ActivityInformationSection />
          <RequiredFacilitiesSection />
          <ActivityScheduleSection />
          <AdditionalInformationSection />
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-100 bg-white px-5 pb-5 pt-3">
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
