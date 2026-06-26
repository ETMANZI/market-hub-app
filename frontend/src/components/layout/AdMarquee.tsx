import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeAlert, Phone, Mail, Megaphone, ArrowRight } from "lucide-react";

type AdItem = {
  id: string | number;
  title?: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
};

type Props = {
  ads?: unknown;
  speed?: "slow" | "normal" | "fast";
};

const softCardStyles = [
  "bg-slate-50 border-slate-200",
  "bg-blue-50/70 border-blue-100",
  "bg-indigo-50/70 border-indigo-100",
  "bg-emerald-50/70 border-emerald-100",
];

const softIconStyles = [
  "bg-white text-slate-600",
  "bg-blue-100/70 text-blue-700",
  "bg-indigo-100/70 text-indigo-700",
  "bg-emerald-100/70 text-emerald-700",
];

export default function AdMarquee({ ads, speed = "normal" }: Props) {
  const adsArray: AdItem[] = Array.isArray(ads) ? ads : [];

  const validAds = useMemo(
    () =>
      adsArray.filter(
        (ad) =>
          ad &&
          ad.id !== undefined &&
          ad.id !== null &&
          (ad.title || ad.description || ad.contact_phone || ad.contact_email)
      ),
    [adsArray]
  );

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstSetRef = useRef<HTMLDivElement | null>(null);

  const [paused, setPaused] = useState(false);

  const pxPerSecondMap = {
    slow: 20,
    normal: 35,
    fast: 55,
  };

  const pxPerSecond = pxPerSecondMap[speed];

  const displayAds =
    validAds.length === 1 ? [...validAds, ...validAds, ...validAds] : validAds;

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;

    if (!track || !firstSet || displayAds.length === 0) return;

    let frameId = 0;
    let lastTime = 0;
    let offset = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused) {
        offset += pxPerSecond * delta;

        const firstWidth = firstSet.offsetWidth;

        if (firstWidth > 0 && offset >= firstWidth) {
          offset = 0;
        }

        track.style.transform = `translate3d(-${offset}px, 0, 0)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    track.style.transform = "translate3d(0, 0, 0)";
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [paused, pxPerSecond, displayAds.length]);

  if (displayAds.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-2">
      <div
        ref={wrapperRef}
        className="w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex items-center gap-4 px-4"
          style={{ width: "max-content", willChange: "transform" }}
        >
          <div ref={firstSetRef} className="flex items-center gap-4">
            {displayAds.map((ad, index) => (
              <div key={`first-${ad.id}-${index}`} className="shrink-0">
                <AdCard ad={ad} index={index} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4" aria-hidden="true">
            {displayAds.map((ad, index) => (
              <div key={`second-${ad.id}-${index}`} className="shrink-0">
                <AdCard ad={ad} index={index + displayAds.length} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdCard({ ad, index }: { ad: AdItem; index: number }) {
  const cardStyle = softCardStyles[index % softCardStyles.length];
  const iconStyle = softIconStyles[index % softIconStyles.length];

  return (
    <Link
      to={`/listings/${ad.id}`}
      className={`flex w-[320px] shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition duration-200 hover:-translate-y-[1px] hover:bg-white hover:shadow-md sm:w-[380px] md:w-[430px] ${cardStyle}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
      >
        <Megaphone size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 ring-1 ring-indigo-100">
            <BadgeAlert size={12} />
            Sponsored
          </span>
        </div>

        {ad.title && (
          <div className="truncate text-sm font-semibold text-slate-800">
            {ad.title}
          </div>
        )}

        {ad.description && (
          <div className="truncate text-xs text-slate-500">
            {ad.description}
          </div>
        )}

        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
          {ad.contact_phone ? (
            <>
              <Phone size={12} className="shrink-0" />
              <span className="truncate">{ad.contact_phone}</span>
            </>
          ) : ad.contact_email ? (
            <>
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{ad.contact_email}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="hidden shrink-0 items-center text-slate-300 sm:flex">
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}