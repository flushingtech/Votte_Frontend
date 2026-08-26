import { Link } from 'react-router-dom';
import { FaInstagram, FaGithub, FaLinkedin, FaMeetup, FaDiscord } from 'react-icons/fa';
import flushingTechLogo from '../assets/flushingtech-logo.webp';

// Real Flushing Tech community links (flushingtech.org)
const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/flushingtech/', Icon: FaInstagram },
  { label: 'Github', href: 'https://github.com/flushingtech', Icon: FaGithub },
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/flushingtech', Icon: FaLinkedin },
  { label: 'Meetup', href: 'https://www.meetup.com/flushing-tech/', Icon: FaMeetup },
  { label: 'Discord', href: 'https://discord.gg/xGgFcZknDR', Icon: FaDiscord },
];

// Ported from the flushingtech.org footer. Home, About, Contact, FAQ, Terms,
// and Privacy are real pages in Votte_Frontend; Engineering Team doesn't
// exist yet, so that one is wired for when it's built.
const linkColumns = [
  {
    heading: 'Links',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Learn More', href: 'https://www.meetup.com/flushing-tech' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Engineering Team', to: '/engineering-team' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  },
];

function FooterLink({ label, to, href }) {
  const className = 'text-gray-400 hover:text-site_orange text-sm transition-colors duration-200';

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="bg-site_navy border-t border-white/10 py-12 sm:py-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={flushingTechLogo} alt="Flushing Tech" className="h-8 w-8" />
              <span className="text-white font-bold text-lg">
                Flushing<span className="text-site_orange">Tech</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              A community of tech enthusiasts in Flushing, NY. Join us to connect, learn, and
              build together.
            </p>
          </div>

          {/* Link columns */}
          {linkColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-white font-semibold mb-4">{column.heading}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Flushing Tech. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-gray-400 hover:text-site_orange transition-colors duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
