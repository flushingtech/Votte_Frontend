import { Link } from 'react-router-dom';
import { FaRocket } from 'react-icons/fa';
import { FiUsers, FiClock, FiMessageSquare, FiCode, FiCheckCircle } from 'react-icons/fi';
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import aboutImage from '../assets/about-team.jpg';

// Ported from flushingtech.org/about
const benefits = [
  {
    title: 'Creative Hackathons',
    description:
      'Join bi-weekly hackathons where we pitch ideas, form teams, and build exciting projects together — no pressure, just fun and innovation.',
    Icon: FaRocket,
  },
  {
    title: 'Supportive Community',
    description:
      'Be part of a welcoming group of developers, designers, and makers who are always ready to share, help, and grow with you.',
    Icon: FiUsers,
  },
  {
    title: 'Consistent Meetups',
    description:
      'Our events run like clockwork — every two weeks you can count on meaningful sessions filled with learning, laughs, and connection.',
    Icon: FiClock,
  },
  {
    title: 'Open Collaboration',
    description:
      "Every voice matters here. Whether you're a beginner or a pro, you'll have a place to contribute, experiment, and make an impact.",
    Icon: FiMessageSquare,
  },
  {
    title: 'Modern Tech Stack',
    description:
      "Explore and work with current, real-world technologies — from full-stack JavaScript to cutting-edge tools used in today's tech teams.",
    Icon: FiCode,
  },
  {
    title: 'Real Connections',
    description:
      "Make new friends, find collaborators, or even a co-founder. It's not just about code — it's about the people you meet along the way.",
    Icon: FiCheckCircle,
  },
];

function About() {
  return (
    <div className="min-h-screen bg-site_navy text-white flex flex-col">
      <LandingNavbar />

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center px-4 sm:px-8 pt-32 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-5">
          About <span className="text-site_orange">Flushing Tech</span>
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed mb-8">
          Flushing Tech is a tech group based in Flushing, New York that hosts bi-weekly meetups
          for developers, designers, and tech enthusiasts. Our mission is to build a vibrant tech
          community in Flushing and provide a platform for learning, networking, and
          collaboration.
        </p>
        <a
          href="https://www.meetup.com/flushing-tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-site_orange hover:bg-site_red text-white font-semibold px-6 py-3 shadow-lg transition-colors duration-300"
        >
          Join Our Meetup
        </a>
      </div>

      {/* Experience section */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="border border-white/10 overflow-hidden">
          <img
            src={aboutImage}
            alt="Flushing Tech members collaborating"
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">The Flushing Tech Experience</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Flushing Tech is more than just a meetup &mdash; it's a thriving community of
            developers, designers, and tech enthusiasts who are passionate about building,
            learning, and collaborating. We host bi-weekly hackathons where we brainstorm, vote
            on project ideas, and create exciting tech together. While a winner is crowned, the
            real goal is to have fun, grow your skills, meet new people, and be part of an
            ever-evolving tech scene.
          </p>
          <Link
            to="/faq"
            className="inline-block bg-white/5 hover:bg-white/10 border border-white/20 hover:border-site_orange/50 text-white font-semibold px-6 py-3 transition-colors duration-300"
          >
            Read Our FAQs
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-2xl">&#9733;</span>
            <div>
              <p className="text-2xl font-bold">4.7</p>
              <p className="text-sm text-gray-400">on Meetup</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiUsers className="text-site_orange w-6 h-6" />
            <div>
              <p className="text-2xl font-bold">630+</p>
              <p className="text-sm text-gray-400">members and growing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Made For People Like You</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A community-first approach to learning, building, and connecting with others in tech.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 hover:border-site_orange/40 p-6 flex flex-col gap-4 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-site_orange/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-site_orange" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;
