import { FaInstagram, FaGithub, FaLinkedin, FaMeetup, FaDiscord } from 'react-icons/fa';
import flushingTechIcon from '../assets/flushingtech-logo.webp';

// Real Flushing Tech community links (flushingtech.org)
const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/flushingtech/', Icon: FaInstagram },
  { label: 'Github', href: 'https://github.com/flushingtech', Icon: FaGithub },
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/flushingtech', Icon: FaLinkedin },
  { label: 'Meetup', href: 'https://www.meetup.com/flushing-tech/', Icon: FaMeetup },
  { label: 'Discord', href: 'https://discord.gg/xGgFcZknDR', Icon: FaDiscord },
];

function LandingNavbar() {
  const handleLogoClick = (event) => {
    event.preventDefault();
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-site_navy/70 backdrop-blur-md border-b border-white/10">
      <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 sm:gap-3">
        <img src={flushingTechIcon} alt="Flushing Tech" className="h-8 w-8 sm:h-9 sm:w-9" />
        <span className="text-white font-bold text-base sm:text-lg tracking-tight">
          Flushing<span className="text-site_orange">Tech</span>
        </span>
      </a>

      <div className="flex items-center gap-3 sm:gap-5">
        {socialLinks.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-gray-300 hover:text-site_orange transition-colors duration-200"
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        ))}
      </div>
    </nav>
  );
}

export default LandingNavbar;
