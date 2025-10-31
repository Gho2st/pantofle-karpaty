export default function LoadingOverlay({ text }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      <span className="mt-4 text-lg text-gray-700 font-medium">{text}</span>
    </div>
  );
}
