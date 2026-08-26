import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import LegalPageLayout from '../components/LegalPageLayout';

// Ported from flushingtech.org's About page FAQ section
const faqs = [
  {
    q: 'Who can join Flushing Tech?',
    a: "Anyone! Whether you're a developer, designer, student, or just curious about tech, you're welcome to join our meetups and events.",
  },
  {
    q: 'How often do meetups happen?',
    a: 'We host events every two weeks, usually on weekday evenings. Check our Meetup page for the latest schedule and topics.',
  },
  {
    q: 'What happens at the hackathons?',
    a: "We vote on ideas, form teams, and build quick projects in a fun, collaborative setting. No pressure — it's all about learning, experimenting, and meeting people.",
  },
  {
    q: 'Is it free to attend?',
    a: 'Yes! All of our meetups and hackathons are completely free to attend. Just RSVP on Meetup and show up!',
  },
  {
    q: 'Do I need to bring anything?',
    a: "Just your laptop (optional), curiosity, and energy. We often pair people up so you don't need to come with a full team or idea.",
  },
  {
    q: 'What kind of projects do people build?',
    a: "Everything from small web apps and design prototypes to hardware hacks and AI experiments. It's open-ended — and we love wild ideas.",
  },
  {
    q: 'Can I just come to watch or network?',
    a: "Absolutely. Participation is encouraged, but there's no pressure to present or build. Many people just come to hang out and meet others in tech.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-white/10">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
      >
        <span className="font-semibold text-white">{q}</span>
        <FiChevronDown
          className={`w-5 h-5 text-site_orange shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-gray-300 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <LegalPageLayout
      title="Frequently Asked Questions"
      subtitle="Everything you need to know before coming to a meetup."
    >
      <div className="space-y-3">
        {faqs.map((item, index) => (
          <FaqItem
            key={item.q}
            q={item.q}
            a={item.a}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>
    </LegalPageLayout>
  );
}

export default Faq;
