import vector from "./vector.svg";
import vector2 from "./vector-2.svg";

export const AiRoomRecommendationsHeaderSection = (): JSX.Element => {
  return (
    <header className="flex w-[356px] items-start pt-1 pb-0 px-0 absolute top-52 left-[26px]">
      <div className="flex-col h-[38px] items-start pt-0.5 pb-0 px-0 flex w-9 relative">
        <div
          aria-hidden="true"
          className="h-9 items-center justify-center bg-blue-50 rounded-xl border border-solid border-blue-100 flex w-9 relative"
        >
          <div className="relative w-5 h-5">
            <img
              className="absolute w-[85.42%] h-[91.67%] top-[8.33%] left-[14.58%]"
              alt=""
              src={vector}
            />
            <img
              className="absolute w-[35.42%] h-[33.33%] top-[66.67%] left-[64.58%]"
              alt=""
              src={vector2}
            />
          </div>
        </div>
      </div>
      <div className="relative w-80 h-[57px]">
        <div className="inline-flex flex-col items-start gap-[1.44px] relative -top-px left-3">
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <h2 className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Bold',Helvetica] font-bold text-slate-900 text-sm tracking-[0] leading-[19.2px] whitespace-nowrap">
              Rekomendasi Ruangan dengan AI
            </h2>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative w-fit mt-[-1.00px] [font-family:'Plus_Jakarta_Sans-Regular',Helvetica] font-normal text-slate-500 text-[11px] tracking-[0] leading-[17.9px]">
              Berdasarkan kebutuhan kegiatanmu, berikut beberapa
              <br />
              ruangan yang sesuai.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
