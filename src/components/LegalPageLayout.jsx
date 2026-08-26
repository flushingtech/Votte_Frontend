import LandingNavbar from './LandingNavbar';
import Footer from './Footer';

function LegalPageLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-site_navy text-white flex flex-col">
      <LandingNavbar />

      <div className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-28 pb-20">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm sm:text-base mb-10">{subtitle}</p>}

          <div className="space-y-8">{children}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default LegalPageLayout;
