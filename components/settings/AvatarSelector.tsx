'use client';

import { useState } from 'react';

// Default avatar options
const defaultAvatars = [
  { id: 'alexander', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alexander', alt: 'Alexander' },
  { id: 'aidan', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aiden', alt: 'Aiden' },
  { id: 'adrian', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Adrian', alt: 'Adrian' },
  { id: 'destiny', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Destiny', alt: 'Destiny' },
  { id: 'christian', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Christian', alt: 'Christian' },
  { id: 'caleb', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Caleb', alt: 'Caleb' },
  { id: 'easton', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Easton', alt: 'Easton' },
  { id: 'brian', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Brian', alt: 'Brian' },
  { id: 'george', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=George', alt: 'George' },
  { id: 'jack', src: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jack', alt: 'Jack' },
];

interface AvatarSelectorProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  disabled?: boolean;
  customUrl?: string;
  onCustomUrlChange?: (url: string) => void;
  onCustomUrlApply?: () => void;
}

export default function AvatarSelector({
  currentAvatarUrl,
  onAvatarChange,
  disabled = false,
  customUrl = '',
  onCustomUrlChange,
  onCustomUrlApply
}: AvatarSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleDefaultAvatarClick = (src: string) => {
    onAvatarChange(src);
    setShowCustomInput(false);
  };

  const handleCustomUrlApply = () => {
    if (customUrl.trim()) {
      onAvatarChange(customUrl);
      setShowCustomInput(false);
    }
    onCustomUrlApply?.();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {defaultAvatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`relative cursor-pointer rounded-full overflow-hidden border-2 ${currentAvatarUrl === avatar.src ? 'border-blue-500' : 'border-transparent'
                } hover:border-blue-300 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && handleDefaultAvatarClick(avatar.src)}
            >
              <div className="h-16 rounded-full relative  overflow-hidden">
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className="object-cover fill w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => !disabled && setShowCustomInput(!showCustomInput)}
          className={`text-sm ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
          disabled={disabled}
        >
          {showCustomInput ? 'Hide custom URL option' : 'Use custom avatar URL'}
        </button>

        {showCustomInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => {
                onCustomUrlChange?.(e.target.value);
              }}
              placeholder="Enter avatar URL"
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleCustomUrlApply}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={disabled || !customUrl.trim()}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {currentAvatarUrl && (
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Current avatar:</p>
          <div className="w-16 h-16 relative rounded-full overflow-hidden border border-gray-200">
            <img
              src={currentAvatarUrl}
              alt="Current avatar"
              className="object-cover fill w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
