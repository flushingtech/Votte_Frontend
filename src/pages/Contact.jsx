import { FiMail } from 'react-icons/fi';
import { FaInstagram, FaGithub, FaLinkedin, FaMeetup, FaDiscord } from 'react-icons/fa';
import LegalPageLayout from '../components/LegalPageLayout';

// Real Flushing Tech contact channels
const channels = [
  { label: 'Discord', href: 'https://discord.gg/xGgFcZknDR', Icon: FaDiscord },
  { label: 'Instagram', href: 'https://www.instagram.com/flushingtech/', Icon: FaInstagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/flushingtech', Icon: FaLinkedin },
  { label: 'Meetup', href: 'https://www.meetup.com/flushing-tech/', Icon: FaMeetup },
  { label: 'GitHub', href: 'https://github.com/flushingtech', Icon: FaGithub },
];

function Contact() {
  return (
    <LegalPageLayout
      title="Contact Us"
      subtitle="Have a question, an idea, or want to get involved? We'd love to hear from you."
    >
      <a
        href="mailto:hello@flushingtech.org"
        className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-site_orange/40 px-6 py-4 transition-colors duration-300"
      >
        <FiMail className="w-5 h-5 text-site_orange shrink-0" />
        <span className="text-white font-semibold">hello@flushingtech.org</span>
      </a>

      <section>
        <h2 className="text-lg font-semibold text-site_orange mb-4">Find us online</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {channels.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-site_orange/40 px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors duration-300"
            >
              <Icon className="w-4 h-4 text-site_orange shrink-0" />
              {label}
            </a>
          ))}
        </div>
      </section>
    </LegalPageLayout>
  );
}

export default Contact;
