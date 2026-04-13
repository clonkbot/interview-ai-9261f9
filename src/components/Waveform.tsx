export function Waveform() {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="waveform-bar w-1 bg-cyan rounded-full"
          style={{
            height: '8px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}
