import { Icon } from '@iconify/react';
import { useThemeStore } from '@/stores/theme';

interface HuePickerProps {
  isOpen: boolean;
}

export function HuePicker({ isOpen }: HuePickerProps) {
  const { hue, setHue } = useThemeStore();
  const defaultHue = 250;

  const handleReset = () => {
    setHue(defaultHue);
  };

  if (!isOpen) return null;

  return (
    <div className="float-panel absolute right-0 top-12 w-72 px-4 py-3 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-bold text-base text-90">
          Theme Color
          <button
            onClick={handleReset}
            className={`btn-regular w-6 h-6 rounded scale-animation ${hue === defaultHue ? 'opacity-0 pointer-events-none' : ''}`}
            aria-label="Reset"
          >
            <Icon icon="fa6-solid:arrow-rotate-left" className="text-xs" />
          </button>
        </div>
        <div className="bg-[var(--btn-regular-bg)] w-8 h-6 rounded flex justify-center font-bold text-xs items-center text-[var(--btn-content)]">
          {hue}
        </div>
      </div>

      {/* Slider */}
      <div className="w-full h-5 px-1 rounded select-none">
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="hue-slider w-full cursor-pointer"
          aria-label="Theme color hue"
        />
      </div>
    </div>
  );
}