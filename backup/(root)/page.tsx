export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Top name */}
        <div className="mb-16">
          <h1 className="text-1xl font-mono text-white">
            Stefano Soatto
          </h1>
        </div>
        
        {/* Bottom two names side by side */}
        <div className="flex justify-center space-x-32">
          <h2 className="text-1xl font-mono text-white">
            Dario Soatto
          </h2>
          <h2 className="text-1xl font-mono text-white">
            Renzo Soatto
          </h2>
        </div>
      </div>
    </div>
  );
}
