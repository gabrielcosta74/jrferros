import { HeroAbout } from '@/src/components/about/HeroAbout';
import { HistoryTimeline } from '@/src/components/about/HistoryTimeline';
import { MissionValues } from '@/src/components/about/MissionValues';

export function About() {
  return (
    <div className="bg-jrs-black min-h-screen pt-0">
      <div className="-mt-[72px]">
        <HeroAbout />
      </div>

      <HistoryTimeline />
      <MissionValues />
    </div>
  );
}
