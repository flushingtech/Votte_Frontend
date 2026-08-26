import { FiMapPin, FiClock, FiUsers, FiMonitor, FiArrowRight } from 'react-icons/fi';
import hackathonPhoto from '../assets/hackathon-queens-college.jpg';
import jamaicaPhoto from '../assets/hackathon-jamaica.jpg';
import onlineWorkshopPhoto from '../assets/hackathon-online-workshop.jpg';

// Real Flushing Tech recurring events (meetup.com/flushingtech)
const events = [
  {
    title: 'Flushing Tech Bi-Weekly Hackathon',
    type: 'In-person hackathon',
    TypeIcon: FiUsers,
    location: 'Tech Incubator at Queens College, CEP Hall #2, 65-30 Kissena Blvd, Flushing, NY 11367',
    time: 'Every 2 weeks, Saturday, 4 PM – 6 PM',
    description:
      'A free-form, self-organized mini hackathon for developers, designers, PMs, students, and tech enthusiasts to brainstorm, build, present, and network.',
    href: 'https://www.meetup.com/flushingtech/events/316145467/',
    image: hackathonPhoto,
    featured: true,
  },
  {
    title: 'Jamaica Tech Bi-Weekly Hackathon',
    type: 'In-person hackathon',
    TypeIcon: FiUsers,
    location: 'Greater Nexus, 89-14 Parsons Blvd, Jamaica, NY 11432',
    time: 'Every 2 weeks, Saturday, 3 PM – 5 PM',
    description:
      'A public mini hackathon where people bring ideas or projects, collaborate, build together, and network.',
    href: 'https://www.meetup.com/flushingtech/events/316048651/',
    image: jamaicaPhoto,
  },
  {
    title: 'Flushing Tech Bi-weekly Online Workshops',
    type: 'Remote workshop',
    TypeIcon: FiMonitor,
    location: 'Online',
    time: 'Every other Saturday, 11:00 AM',
    description:
      'Interactive online sessions focused on learning together through build-alongs, deep dives, code reading, lightning talks, and mini workshops.',
    href: 'https://www.meetup.com/flushingtech/events/316240881/',
    image: onlineWorkshopPhoto,
  },
];

function EventTypeBadge({ type, TypeIcon }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-site_orange/10 text-site_orange text-xs font-semibold uppercase tracking-wide">
      <TypeIcon className="w-3.5 h-3.5" />
      {type}
    </span>
  );
}

function EventMeta({ location, time }) {
  return (
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-start gap-2">
        <FiMapPin className="w-4 h-4 text-site_orange mt-0.5 shrink-0" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-2">
        <FiClock className="w-4 h-4 text-site_orange shrink-0" />
        <span>{time}</span>
      </div>
    </div>
  );
}

function ViewEventLink() {
  return (
    <span className="inline-flex items-center gap-1.5 text-site_orange font-semibold text-sm">
      View event
      <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );
}

function UpcomingEventsSection() {
  const featured = events.find((e) => e.featured);
  const rest = events.filter((e) => !e.featured);

  return (
    <section className="relative bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* Subtle warm accents, keeps it from feeling flat */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-site_orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-peach/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center mb-10 sm:mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-site_navy mb-3">
          Upcoming <span className="text-site_orange">Events</span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Join us in person or online &mdash; pick the format that works for you.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Featured card */}
        <a
          href={featured.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col overflow-hidden bg-white border border-gray-200 hover:border-site_orange/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative h-52 sm:h-64 overflow-hidden">
            <img
              src={featured.image}
              alt="Builders presenting at a Flushing Tech hackathon at Queens College"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0"></div>
          </div>

          <div className="flex flex-col flex-1 p-8 sm:p-10">
            <EventTypeBadge type={featured.type} TypeIcon={featured.TypeIcon} />

            <h3 className="text-2xl sm:text-3xl font-bold text-site_navy mt-5 mb-4">
              {featured.title}
            </h3>

            <EventMeta location={featured.location} time={featured.time} />

            <p className="text-gray-500 leading-relaxed mt-5 mb-6 max-w-md">
              {featured.description}
            </p>

            <div className="mt-auto">
              <ViewEventLink />
            </div>
          </div>
        </a>

        {/* Two stacked cards */}
        <div className="grid grid-rows-2 gap-6">
          {rest.map((event) => (
            <a
              key={event.title}
              href={event.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex bg-white border border-gray-200 hover:border-site_orange/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                event.image ? 'flex-row items-stretch' : 'flex-col p-6'
              }`}
            >
              {event.image && (
                <div className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
                  <img
                    src={event.image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className={`flex flex-col flex-1 min-w-0 ${event.image ? 'p-5' : ''}`}>
                <EventTypeBadge type={event.type} TypeIcon={event.TypeIcon} />

                <h3 className="text-lg font-bold text-site_navy mt-4 mb-3">
                  {event.title}
                </h3>

                <EventMeta location={event.location} time={event.time} />

                <p className="text-gray-500 text-sm leading-relaxed mt-3 mb-4 line-clamp-2">
                  {event.description}
                </p>

                <div className="mt-auto">
                  <ViewEventLink />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UpcomingEventsSection;
