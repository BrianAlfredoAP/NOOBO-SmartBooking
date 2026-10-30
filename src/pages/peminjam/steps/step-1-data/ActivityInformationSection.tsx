import { useState } from "react";

const initialActivity = {
  name: "TEMATICS 2026",
  purpose: "Ospek Jurusan Informatika 2026",
  participants: "150",
};

export const ActivityInformationSection = () => {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [participants, setParticipants] = useState("");

  return (
    <section
      aria-labelledby="activity-information-title"
      className="relative flex w-full flex-col items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-solid border-slate-100 shadow-[0px_1px_2px_#0000000d]"
    >
      <header className="flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex w-10 h-10 items-center justify-center relative bg-blue-50 rounded-xl">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="text-blue-600 text-xl font-bold"
            >
              ▣
            </span>
          </div>
        </div>
        <div className="relative w-[250.19px] h-[35.5px]">
          <div className="inline-flex flex-col items-start gap-0.5 relative -top-px left-3">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <h2
                id="activity-information-title"
                className="flex items-center [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-slate-900 text-sm tracking-[0] leading-[17.5px] whitespace-nowrap relative w-fit mt-[-1.00px]"
              >
                Informasi Kegiatan
              </h2>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="flex items-center [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-slate-500 text-xs tracking-[0] leading-4 whitespace-nowrap relative w-fit mt-[-1.00px]">
                Jelaskan kegiatan yang akan dilaksanakan.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="activity-name"
              className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-700 text-xs tracking-[0] leading-4"
            >
              Nama Kegiatan
            </label>
          </div>
          <div className="flex items-start justify-center px-3.5 py-2.5 relative self-stretch w-full flex-[0_0_auto] bg-[#f8fafc80] rounded-xl overflow-hidden border border-solid border-slate-200">
            <div className="flex flex-col items-start relative flex-1 grow overflow-hidden">
              <input
                id="activity-name"
                name="activityName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="TEMATICS 2026"
                className="relative flex items-center self-stretch w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="activity-purpose"
              className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-700 text-xs tracking-[0] leading-4"
            >
              Tujuan Kegiatan
            </label>
          </div>
          <div className="flex flex-col items-start gap-[5px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex w-full flex-col gap-1.5">
              <div className="h-[80px] w-full rounded-xl border border-slate-200 bg-[#f8fafc80] px-3.5 py-2.5">
                <textarea
                  id="activity-purpose"
                  name="activityPurpose"
                  maxLength={500}
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="Ospek Jurusan Informatika 2026"
                  className="!m-0 !block h-full w-full resize-none !border-0 !rounded-none !bg-transparent !p-0 text-sm font-medium leading-5 text-slate-800 outline-none ring-0 focus:!border-0 focus:ring-0 placeholder:text-slate-400"
                />
              </div>

              <div className="flex w-full justify-end">
                <span className="text-[11px] leading-4 text-slate-400">
                  {purpose.length}/500
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="-mt-4 flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <label
              htmlFor="activity-participants"
              className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-SemiBold',Helvetica] font-semibold text-slate-700 text-xs tracking-[0] leading-4"
            >
              Jumlah Peserta
            </label>
          </div>
          <div className="flex items-center relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex flex-col items-start pl-3.5 pr-14 py-2.5 relative flex-1 grow bg-[#f8fafc80] rounded-xl overflow-hidden border border-solid border-slate-200">
              <div className="flex items-center relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col items-start relative flex-1 grow">
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] overflow-hidden">
                    <input
                      id="activity-participants"
                      name="activityParticipants"
                      type="number"
                      min="1"
                      value={participants}
                      onChange={(event) => setParticipants(event.target.value)}
                      placeholder="150"
                      className="relative flex items-center self-stretch w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex flex-col items-start absolute top-[13px] right-3.5">
              <span className="flex items-center [font-family:'Plus_Jakarta_Sans-Medium',Helvetica] font-medium text-slate-400 text-xs tracking-[0] leading-4 whitespace-nowrap relative w-fit mt-[-1.00px]">
                orang
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
