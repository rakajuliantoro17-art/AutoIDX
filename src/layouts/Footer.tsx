export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 px-6 py-4 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-2">
      <p>© AutoIDX - Automated Indodax Trading Engine</p>
      <div className="flex items-center space-x-4">
        <a
          href="https://github.com/rakajuliantoro17-art/AutoIDX"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 transition"
        >
          GitHub Repository
        </a>
        <span>•</span>
        <a
          href="https://indodax.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 transition"
        >
          Indodax Market
        </a>
      </div>
    </footer>
  );
}
