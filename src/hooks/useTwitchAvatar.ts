/**
 * useTwitchAvatar Hook
 *
 * Reads the Twitch avatar <img> URL that already exists in YOUR page DOM.
 * - Does NOT access Twitch iframe (CORS-safe).
 * - Uses MutationObserver to detect when the avatar node appears/changes.
 * - Optional polling backstop (disabled by default).
 *
 * Default selector targets the exact structure you shared:
 * <div class="ScAvatar-sc-144b42z-0 dLsNfm tw-avatar">
 *   <img class="InjectLayout-sc-1i43xsx-0 fAYJcN tw-image tw-image-avatar" src="https://static-cdn.jtvnw.net/jtv_user_pictures/.../profile_image-150x150.png" />
 * </div>
 */

import { useEffect, useState } from 'react';

type UseTwitchAvatarOptions = {
  /**
   * CSS selector to locate the avatar image in your DOM.
   * Provide multiple comma-separated selectors for resilience if needed.
   */
  selector?: string;
  /**
   * Which attribute to read from the selected element (src).
   */
  attribute?: 'src';
  /**
   * Optional polling interval in ms as a backstop (0 = disabled).
   */
  pollMs?: number;
};

export function useTwitchAvatar(
  {
    selector = '.tw-avatar img.tw-image-avatar, .ScAvatar-sc-144b42z-0 img.tw-image-avatar, img.tw-image.tw-image-avatar',
    attribute = 'src',
    pollMs = 0
  }: UseTwitchAvatarOptions = {}
): string {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let pollId: number | null = null;

    const findValue = (): string | null => {
      const img = document.querySelector(selector) as HTMLImageElement | null;
      return img?.getAttribute(attribute) || null;
    };

    const updateIfChanged = () => {
      const next = findValue();
      if (next && next !== url) {
        setUrl(next);
      }
    };

    // Initial read
    updateIfChanged();

    // Observe DOM changes to capture when Twitch (or your code) mounts/updates the avatar
    observer = new MutationObserver(() => {
      updateIfChanged();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src', 'class']
    });

    // Optional polling (disabled by default)
    if (pollMs > 0) {
      pollId = window.setInterval(updateIfChanged, pollMs);
    }

    return () => {
      observer?.disconnect();
      if (pollId) window.clearInterval(pollId);
    };
    // Intentionally exclude `url` from deps to avoid feedback loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, attribute, pollMs]);

    return url;
}
