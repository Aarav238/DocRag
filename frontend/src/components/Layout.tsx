import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/upload', label: 'Upload', icon: 'upload_file' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/chat', label: 'Chat', icon: 'chat_bubble' },
  { path: '/draft', label: 'Draft', icon: 'edit_note' },
  { path: '/guide', label: 'Guide', icon: 'auto_stories' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 flex flex-col py-6 space-y-2 border-r border-slate-100">
        <div className="px-6 mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 primary-gradient rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-indigo-950 leading-tight font-headline">DocRAG</h1>
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">The Intelligent Layer</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/draft' && location.pathname.startsWith('/draft'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mx-2 flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out group ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-indigo-500 hover:bg-indigo-50/50'
                }`}
              >
                <span
                  className="material-symbols-outlined mr-3"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4">
          <Link
            to="/upload"
            className="w-full py-3 px-4 rounded-xl primary-gradient text-white text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Analysis
          </Link>
        </div>

      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
