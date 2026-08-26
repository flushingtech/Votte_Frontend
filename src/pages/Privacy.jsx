import LegalPageLayout from '../components/LegalPageLayout';

// Ported from flushingtech.org/privacy
const sections = [
  {
    heading: '1. Introduction',
    body: 'At FlushingTech.org, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or participate in our programs.',
  },
  {
    heading: '2. Information We Collect',
    body: 'We may collect personal information such as your name, email address, phone number, and any other information you voluntarily provide through forms or interactions on our site.',
  },
  {
    heading: '3. How We Use Your Information',
    body: "We use your information to provide services, communicate with you about our programs, send updates or newsletters (if you've opted in), and improve your experience on our website.",
  },
  {
    heading: '4. Sharing of Information',
    body: 'We do not sell or rent your personal information. We may share data with trusted partners who help us operate our website or deliver services, provided they also respect your privacy.',
  },
  {
    heading: '5. Cookies',
    body: 'Our website may use cookies to understand how visitors use our site. You can control cookies through your browser settings.',
  },
  {
    heading: '6. Your Rights',
    body: 'You may request access to the information we have about you, ask us to update or delete it, or withdraw consent to receive communications at any time.',
  },
  {
    heading: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We encourage you to review this page periodically for the latest information.',
  },
  {
    heading: '8. Contact Us',
    body: 'If you have any questions about this Privacy Policy or how we handle your data, please contact us at hello@flushingtech.org.',
  },
];

function Privacy() {
  return (
    <LegalPageLayout title="Privacy Policy" subtitle="Last updated: July 26, 2025">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-lg font-semibold text-site_orange mb-2">{section.heading}</h2>
          <p className="text-gray-300 leading-relaxed">{section.body}</p>
        </section>
      ))}
    </LegalPageLayout>
  );
}

export default Privacy;
