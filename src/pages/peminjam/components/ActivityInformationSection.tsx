import { useState } from "react";

const initialActivity = {
  name: "TEMATICS 2026",
  purpose: "Ospek Jurusan Informatika 2026",
  participants: "150",
};

export const ActivityInformationSection = () => {
  const [name, setName] = useState(initialActivity.name);
  const [purpose, setPurpose] = useState(initialActivity.purpose);
  const [participants, setParticipants] = useState(
    initialActivity.participants,
  );

  return (
    <section
      aria-labelledby="activity-information-title"
      className="top-[230px] flex flex-col w-full items-start gap-4 p-4 absolute left-px bg-slate-50 rounded-2xl border border-solid border-slate-100 shadow-[0px_1px_2px_#0000000d]"
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
      <div className="flex flex-col items-start gap-3.5 relative self-stretch w-full flex-[0_0_auto]">
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
            <div className="flex flex-col items-start relative flex-1 grow overflow-scroll">
              <input
                id="activity-name"
                name="activityName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="relative flex items-center self-stretch w-full bg-transparent border-0 p-0 outline-none [font-family:'Plus_Jakarta_Sans-Medium',Helvetica] font-medium text-slate-800 text-sm tracking-[0] leading-5"
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
            <div className="h-[54px] justify-center pt-2.5 pb-[25px] px-3.5 bg-[#f8fafc80] rounded-xl overflow-scroll border border-solid border-slate-200 flex items-start relative self-stretch w-full">
              <div className="flex flex-col items-start relative flex-1 grow">
                <textarea
                  id="activity-purpose"
                  name="activityPurpose"
                  maxLength={500}
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  className="relative flex items-center self-stretch w-full h-5 resize-none overflow-hidden bg-transparent border-0 p-0 outline-none [font-family:'Plus_Jakarta_Sans-Medium',Helvetica] font-medium text-slate-800 text-sm tracking-[0] leading-5"
                />
              </div>
            </div>
            <div className="flex flex-col items-end pt-0 pb-0.5 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex items-center justify-end [font-family:'Plus_Jakarta_Sans-Medium',Helvetica] font-medium text-slate-400 text-[11px] text-right tracking-[-0.28px] leading-[16.5px] whitespace-nowrap relative w-fit mt-[-1.00px]">
                {purpose.length}/500
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
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
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] overflow-scroll">
                    <input
                      id="activity-participants"
                      name="activityParticipants"
                      type="number"
                      min="0"
                      value={participants}
                      onChange={(event) => setParticipants(event.target.value)}
                      className="relative flex items-center self-stretch w-full bg-transparent border-0 p-0 outline-none [font-family:'Plus_Jakarta_Sans-Medium',Helvetica] font-medium text-slate-800 text-sm tracking-[0] leading-5"
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
