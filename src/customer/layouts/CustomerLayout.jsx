import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-hidden flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
