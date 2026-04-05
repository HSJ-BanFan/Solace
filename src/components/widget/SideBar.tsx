import { Profile } from './Profile';
import { Categories } from './Categories';
import { Tags } from './Tags';

interface SideBarProps {
  className?: string;
}

export function SideBar({ className }: SideBarProps) {
  return (
    <div id="sidebar" className={`w-full ${className || ''}`}>
      {/* Profile - 非sticky */}
      <div className="flex flex-col w-full gap-4 mb-4">
        <Profile />
      </div>

      {/* Categories & Tags - sticky */}
      <div id="sidebar-sticky" className="transition-all duration-700 flex flex-col w-full gap-4 top-4 sticky top-4">
        <Categories className="onload-animation" style={{ animationDelay: '150ms' }} />
        <Tags className="onload-animation" style={{ animationDelay: '200ms' }} />
      </div>
    </div>
  );
}