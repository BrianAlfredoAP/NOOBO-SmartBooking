import type { ReactElement } from "react";
import { useState } from "react";
import { UserRound, ChevronDown } from "lucide-react";

const organizations = [
  "Himpunan Mahasiswa Informatika",
  "Badan Eksekutif Mahasiswa",
  "Unit Kegiatan Mahasiswa",
];

export const BorrowingSection = (): ReactElement => {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <section
      aria-labelledby="borrower-information-title"
      className="relative flex h-auto w-full flex-col items-start gap-4 p-4 rounded-2xl border border-solid border-slate-100 bg-slate-50 shadow-[0px_1px_2px_#0000000d]"
    >
      <header className="flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex w-10 h-10 items-center justify-center relative bg-blue-50 rounded-xl">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <UserRound className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="relative w-[258.44px] h-[35.5px]">
          <div className="inline-flex flex-col items-start gap-0.5 relative -top-px left-3">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id="borrower-information-title"
                className="flex items-center [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-slate-900 text-sm tracking-[0] leading-[17.5px] whitespace-nowrap relative w-fit mt-[-1.00px]"
              >
                Data Peminjam
              </h2>
            </div>

            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-slate-500 text-xs tracking-[0] leading-4 whitespace-nowrap">
                Lengkapi data diri dan organisasi peminjam.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-start gap-3.5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="borrower-full-name"
              className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-700 text-xs tracking-[0] leading-4"
            >
              Nama Lengkap
            </label>
          </div>

          <div className="flex items-start justify-center px-3.5 py-2.5 relative self-stretch w-full flex-[0_0_auto] bg-[#f8fafc80] rounded-xl overflow-hidden border border-solid border-slate-200">
            <input
              id="borrower-full-name"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Brian Alfredo"
              className="relative flex items-center self-stretch w-full min-w-0 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="borrower-organization"
              className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-700 text-xs tracking-[0] leading-4"
            >
              Organisasi / Unit Kegiatan
            </label>
          </div>

          <div className="relative flex flex-col items-start self-stretch w-full flex-[0_0_auto]">
            <div className="items-center pl-3.5 pr-10 py-2.5 self-stretch w-full flex-[0_0_auto] flex justify-center relative bg-[#f8fafc80] rounded-xl border border-solid border-slate-200">
              <select
                id="borrower-organization"
                name="organization"
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                className="relative flex items-center self-stretch mt-[-1px] w-full min-w-0 appearance-none bg-transparent outline-none text-sm text-slate-800"
              >
                <option value="" disabled>
                  Pilih Organisasi / Unit Kegiatan
                </option>

                {organizations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="borrower-phone"
              className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-700 text-xs tracking-[0] leading-4"
            >
              Nomor WhatsApp
            </label>
          </div>

          <div className="flex items-start relative self-stretch w-full flex-[0_0_auto] bg-[#f8fafc80] rounded-xl overflow-hidden border border-solid border-slate-200">
            <div className="inline-flex items-center px-3 py-0 relative self-stretch flex-[0_0_auto] bg-[#f1f5f999] border-r [border-right-style:solid] border-slate-200">
              <div className="flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[1px]">
                <svg
                  viewBox="0 0 20 14"
                  className="h-full w-full"
                  role="img"
                  aria-label="Bendera Indonesia"
                >
                  <rect width="20" height="7" fill="#EF3340" />
                  <rect y="7" width="20" height="7" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="inline-flex flex-col items-start pl-1.5 pr-0 py-0 relative flex-[0_0_auto]">
                <span className="flex items-center [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-600 text-xs tracking-[0] leading-4 whitespace-nowrap relative w-fit mt-[-1.00px]">
                  +62
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start px-3 py-2.5 relative flex-1 self-stretch grow">
              <input
                id="borrower-phone"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(event.target.value.replace(/\D/g, ""))
                }
                placeholder="8XXXXXXXXXX"
                className="relative flex items-center self-stretch w-full min-w-0 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};