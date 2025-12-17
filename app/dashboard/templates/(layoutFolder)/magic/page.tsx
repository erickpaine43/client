import { Star } from "lucide-react";

function page() {
  const gallery = [];
  if (gallery.length === 0) {
    return (
      <div className="p-8 w-full h-full flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600">
            This tab is under construction. But trust us, it’ll be worth the
            wait.
          </p>
        </div>
      </div>
    );
  }
  return null;
}
export default page;
