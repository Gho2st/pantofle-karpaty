export default function CartSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-md shrink-0"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-4 bg-gray-200 rounded self-center"></div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
        <div className="p-6 bg-white rounded-lg shadow-lg animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
