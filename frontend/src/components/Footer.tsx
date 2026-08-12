import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#160b0c] border-t-4 border-[#ffb3b5] w-full mt-auto relative z-10 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span className="font-mono-tech font-bold text-sm text-[#f4dddd] tracking-wider uppercase">
            WebGuardian
          </span>
          <p className="text-[#debfbf] text-[13px] font-sans">
            © 2024 WebGuardian Sentinel Protocol. All systems active.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2 md:items-end justify-center">
          <div className="flex flex-wrap gap-6 font-mono-tech text-[12px] text-[#ffb3b5]">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#debfbf] hover:text-white hover:underline decoration-[#ffb3b5] transition-colors">
              Privacy Policy
            </a>
            <a href="#hipaa" onClick={(e) => e.preventDefault()} className="text-[#debfbf] hover:text-white hover:underline decoration-[#ffb3b5] transition-colors">
              HIPAA Compliance
            </a>
            <a href="#terminal" onClick={(e) => e.preventDefault()} className="text-[#debfbf] hover:text-white hover:underline decoration-[#ffb3b5] transition-colors">
              Terminal Access
            </a>
            <a href="#support" onClick={(e) => e.preventDefault()} className="text-[#debfbf] hover:text-white hover:underline decoration-[#ffb3b5] transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
