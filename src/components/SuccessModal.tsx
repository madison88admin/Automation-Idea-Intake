import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  ideaId: string;
}

export function SuccessModal({ isOpen, onClose, title, ideaId }: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Fire confetti from both sides
    const end = Date.now() + 1500;
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Big burst in the center
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors,
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
        {/* Success header with gradient */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 px-6 pt-8 pb-10 text-center relative">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Idea Submitted!</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-5">
            <p className="text-sm text-gray-500 mb-3 text-center">
              Thank you for your submission! The IT team will review your idea and get back to you.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Submitted Idea</p>
              <p className="font-semibold text-gray-800 text-sm">{title}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs text-gray-400">Reference: {ideaId.substring(0, 20)}...</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-md active:scale-[0.98]"
          >
            Submit Another Idea
          </button>
        </div>
      </div>
    </div>
  );
}
