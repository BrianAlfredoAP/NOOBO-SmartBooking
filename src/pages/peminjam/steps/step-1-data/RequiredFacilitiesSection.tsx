
import { useState } from "react";
import type { ReactElement } from "react";

type Facility = {
  id: string;
  label: string;
  checked: boolean;
};

const facilities: Facility[] = [
  { id: "projector", label: "Proyektor", checked: true },
  { id: "whiteboard", label: "Papan tulis", checked: false },
  { id: "microphone", label: "Mikrofon / Sound System", checked: true },
  { id: "additional-chairs", label: "Kursi Tambahan", checked: false },
  { id: "walkie-talkie", label: "HT", checked: false },
  { id: "other", label: "Lainnya", checked: false },
];

export const RequiredFacilitiesSection = (): ReactElement => {
  const [selectedFacilities, setSelectedFacilities] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      facilities.map((facility) => [facility.id, facility.checked]),
    ),
  );

  const handleFacilityChange = (id: string): void => {
    setSelectedFacilities((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <section
      aria-labelledby="required-facilities-title"
      className="relative flex w-full flex-col gap-3 rounded-2xl border border-solid border-slate-100 bg-slate-50 p-4 shadow-[0px_1px_2px_#0000000d]"
    >
      <header className="flex w-full items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl font-medium leading-none text-blue-600">
          +
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="required-facilities-title"
            className="text-sm font-bold leading-[17.5px] text-slate-900"
          >
            Fasilitas / Barang yang Dibutuhkan
          </h2>
          <p className="mt-0.5 text-xs leading-4 text-slate-500">
            Pilih fasilitas atau barang yang diperlukan.
          </p>
        </div>
      </header>

      <fieldset className="grid grid-cols-2 gap-x-3 gap-y-3 border-0 p-0">
        <legend className="sr-only">Fasilitas yang dibutuhkan</legend>

        {facilities.map((facility) => {
          const isSelected = Boolean(selectedFacilities[facility.id]);

          return (
            <label
              key={facility.id}
              htmlFor={`facility-${facility.id}`}
              className="flex min-w-0 cursor-pointer items-start gap-2"
            >
              <input
                id={`facility-${facility.id}`}
                name="required-facilities"
                type="checkbox"
                value={facility.id}
                checked={isSelected}
                onChange={() => handleFacilityChange(facility.id)}
                className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded border border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <span
                className={`pointer-events-none -ml-6 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center ${
                  isSelected ? "text-white" : "text-transparent"
                }`}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="h-3 w-3"
                >
                  <path
                    d="m2 6 2.5 2.5L10 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="min-w-0 text-xs font-medium leading-4 text-slate-700">
                {facility.label === "Mikrofon / Sound System" ? (
                  <>
                    Mikrofon / Sound
                    <br />
                    System
                  </>
                ) : (
                  facility.label
                )}
              </span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
};
