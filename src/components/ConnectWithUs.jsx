import { SiMeetup, SiEventbrite, SiDiscord, SiLinkedin, SiInstagram } from 'react-icons/si';
import lumaIcon from '../assets/luma-icon.png';

// Real Flushing Tech community links (flushingtech.org)
const platforms = [
  {
    name: 'Meetup',
    description: 'RSVP to events',
    href: 'https://www.meetup.com/flushing-tech/',
    color: '#ED1C40',
    Icon: SiMeetup,
  },
  {
    name: 'Luma',
    description: 'Browse our events',
    href: 'https://luma.com/flushingtech',
    color: '#B983FF',
    image: lumaIcon,
  },
  {
    name: 'Eventbrite',
    description: 'Grab your tickets',
    href: 'https://www.eventbrite.com/o/64475661283',
    color: '#F05537',
    Icon: SiEventbrite,
  },
  {
    name: 'Discord',
    description: 'Join the conversation',
    href: 'https://discord.gg/xGgFcZknDR',
    color: '#5865F2',
    Icon: SiDiscord,
  },
  {
    name: 'LinkedIn',
    description: 'Follow our page',
    href: 'https://www.linkedin.com/company/flushingtech',
    color: '#0A66C2',
    Icon: SiLinkedin,
  },
  {
    name: 'Instagram',
    description: 'See event photos',
    href: 'https://www.instagram.com/flushingtech/',
    color: '#E4405F',
    Icon: SiInstagram,
  },
];

function ConnectWithUs() {
  return (
    <section className="relative bg-site_navy py-16 sm:py-20 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* Decorative glow, echoes the hero's background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 left-1/4 w-72 h-72 bg-site_orange/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 right-1/4 w-72 h-72 bg-site_red/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Stay in the <span className="text-site_orange">loop</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Follow along, RSVP to events, and join the conversation across our channels.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {platforms.map(({ name, description, href, color, Icon, image }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ '--accent': color }}
            className="group relative flex flex-col items-center text-center gap-3 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-[var(--accent)] pt-7 pb-5 px-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_var(--accent)]"
          >
            <span
              aria-hidden="true"
              className="absolute top-0 left-5 right-5 h-[3px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: color }}
            />

            <span
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ boxShadow: `0 0 0 4px ${color}26` }}
            >
              {image ? (
                <img src={image} alt="" className="w-full h-full object-cover" />
              ) : (
                <Icon className="w-6 h-6" style={{ color }} />
              )}
            </span>

            <div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-gray-500 text-xs mt-1">{description}</p>
            </div>

            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300"
              style={{ color }}
            >
              &rarr;
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default ConnectWithUs;
