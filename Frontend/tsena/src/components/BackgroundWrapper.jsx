export default function BackgroundWrapper({ children }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/backgrounds/svg_backgrounds_animated/bg_static_pages_animated.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {children}
    </div>
  );
}
