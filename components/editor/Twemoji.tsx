import { memo } from 'react';
import { cn } from '@/lib/utils';

interface TwemojiProps {
  emoji: string;
  className?: string;
  title?: string;
  loading?: 'lazy' | 'eager';
}

const Twemoji_: React.FC<TwemojiProps> = ({ emoji, className, title, loading = 'eager' }) => {
  // Convert emoji to codepoint for Twemoji CDN
  const codePoints = Array.from(emoji)
    .map(char => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-');

  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoints}.svg`}
      alt={emoji}
      title={title}
      loading={loading}
      className={cn('inline-block', className)}
    />
  );
};

export const Twemoji = memo(Twemoji_);
