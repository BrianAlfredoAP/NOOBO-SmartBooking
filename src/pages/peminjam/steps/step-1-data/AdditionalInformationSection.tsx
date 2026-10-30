import { useState } from "react";

export const AdditionalInformationSection = () => {
  const [additionalInformation, setAdditionalInformation] = useState("");

  return (
    <section className="relative flex h-auto w-full flex-col items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-solid border-slate-100 shadow-[0px_1px_2px_#0000000d]">
      <header className="flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex w-10 h-10 items-center justify-center relative bg-blue-50 rounded-xl">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="text-lg font-bold leading-none text-blue-600"
            >
              i
            </span>
          </div>
        </div>

        <div className="relative w-[270.8px] h-[35.5px]">
          <div className="inline-flex flex-col items-start gap-0.5 relative -top-px left-3">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <h2 className="[font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-normal text-transparent text-sm tracking-[0] leading-[17.5px] whitespace-nowrap relative w-fit mt-[-1.00px]">
                <span className="font-bold text-slate-900">
                  Informasi Tambahan{" "}
                </span>
                <span className="[font-family:'Plus_Jakarta_Sans-Regular',Helvetica] text-slate-500">
                  (Opsional)
                </span>
              </h2>
            </div>

            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="flex items-center [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-slate-500 text-xs tracking-[0] leading-4 whitespace-nowrap relative w-fit mt-[-1.00px]">
                Contoh: susunan acara, kebutuhan khusus, dll.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col gap-1.5">
        <div className="h-[112px] w-full rounded-xl border border-slate-200 bg-[#f8fafc80] px-3.5 py-2.5">
          <textarea
            id="additional-information"
            name="additionalInformation"
            value={additionalInformation}
            onChange={(event) => setAdditionalInformation(event.target.value)}
            maxLength={500}
            aria-describedby="additional-information-counter"
            placeholder={"Contoh: susunan acara, kebutuhan khusus,\ndll."}
            className="block h-full w-full resize-none overflow-y-auto overflow-x-hidden border-0 bg-transparent p-0 text-sm font-medium leading-5 text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex w-full justify-end">
          <span
            id="additional-information-counter"
            aria-live="polite"
            className="text-[11px] leading-4 text-slate-400"
          >
            {additionalInformation.length}/500
          </span>
        </div>
      </div>
    </section>
  );
}