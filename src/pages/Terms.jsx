import LegalPageLayout from '../components/LegalPageLayout';

// Ported from flushingtech.org/terms
const sections = [
  {
    heading: '1. Acceptance of Terms',
    body: 'By accessing or using this website, you agree to be bound by these Terms and Services. If you do not agree, please do not use our site.',
  },
  {
    heading: '2. Use of the Website',
    body: "You agree to use the website only for lawful purposes and in a way that does not infringe on the rights of, restrict, or inhibit anyone else's use of the site.",
  },
  {
    heading: '3. Intellectual Property',
    body: 'All content on this site, including text, graphics, logos, and images, is the property of Flushing Tech Meetup unless otherwise stated. Unauthorized use is prohibited.',
  },
  {
    heading: '4. Limitation of Liability',
    body: 'We are not liable for any damages or losses resulting from your use of this site. The website and its content are provided "as is" without warranties of any kind.',
  },
  {
    heading: '5. Changes to These Terms',
    body: 'We may update these Terms and Services from time to time. Continued use of the site after changes are posted means you accept the new terms.',
  },
  {
    heading: '6. Contact Us',
    body: 'If you have any questions about these terms, you can contact us at hello@flushingtech.org.',
  },
];

function Terms() {
  return (
    <LegalPageLayout title="Terms and Services" subtitle="Last updated: July 26, 2025">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-lg font-semibold text-site_orange mb-2">{section.heading}</h2>
          <p className="text-gray-300 leading-relaxed">{section.body}</p>
        </section>
      ))}
    </LegalPageLayout>
  );
}

export default Terms;
