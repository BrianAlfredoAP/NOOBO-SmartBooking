import { useState } from "react";

export const AdditionalInformationSection = () => {
  const [additionalInformation, setAdditionalInformation] = useState("");

  return (
    <section className="h-[198px] top-[980px] flex flex-col w-full items-start gap-4 p-4 absolute left-px bg-slate-50 rounded-2xl border border-solid border-slate-100 shadow-[0px_1px_2px_#0000000d]">
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

      <div className="flex-col gap-2.5 flex-[0_0_auto] mb-[-7.00px] flex items-start relative self-stretch w-full">
        <div className="justify-center pt-2.5 pb-[30px] px-3.5 flex-[0_0_auto] bg-transparent overflow-scroll border border-solid border-slate-200 flex items-start relative self-stretch w-full">
          <label htmlFor="additional-information" className="sr-only">
            Informasi tambahan
          </label>

          <textarea
            id="additional-information"
            name="additionalInformation"
            value={additionalInformation}
            onChange={(event) => setAdditionalInformation(event.target.value)}
            maxLength={500}
            aria-describedby="additional-information-counter"
            placeholder={"Contoh: susunan acara, kebutuhan khusus,\ndll."}
            className="flex min-h-0 h-full w-full flex-1 grow resize-none overflow-hidden border-0 bg-transparent p-0 [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-slate-400 text-sm tracking-[0] leading-5 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col items-end gap-[5px] pt-[5px] pb-0.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
          <div
            id="additional-information-counter"
            aria-live="polite"
            className="flex items-center justify-end [font-family:'Plus_Jakarta_Sans-Medium',Helvetica] font-medium text-slate-400 text-[11px] text-right tracking-[-0.28px] leading-[16.5px] whitespace-nowrap relative w-fit mt-[-1.00px]"
          >
            {additionalInformation.length}/500
          </div>
        </div>
      </div>
    </section>
  );
}