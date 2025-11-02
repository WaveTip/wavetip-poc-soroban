import { TWITCH_CHANNEL, RECIPIENT_NAME } from '../utils/constants'

export function StreamLayout() {
  // Get current hostname for Twitch iframe (works in dev and production)
  const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
      {/* Twitch Stream */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <iframe
          style={{ width: '100%', height: '480px', border: 'none' }}
          src={`https://player.twitch.tv/?channel=${TWITCH_CHANNEL}&parent=${parentHost}&muted=false`}
          title={`${RECIPIENT_NAME} Twitch Stream`}
          allowFullScreen
          aria-label={`${RECIPIENT_NAME} Twitch live stream`}
        ></iframe>
      </div>

      {/* Twitch Chat */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <iframe
          style={{ width: '100%', height: '480px', border: 'none' }}
          src={`https://www.twitch.tv/embed/${TWITCH_CHANNEL}/chat?parent=${parentHost}&darkpopout`}
          title="Twitch Chat"
          aria-label="Twitch chat for the live stream"
        ></iframe>
      </div>
    </div>
  )
}

