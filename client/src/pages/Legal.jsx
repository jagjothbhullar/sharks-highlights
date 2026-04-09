import { useLocation, Link } from 'react-router-dom';

export default function Legal() {
  const { pathname } = useLocation();
  const isTerms = pathname === '/terms';

  return (
    <div className="page legal-page" style={{ maxWidth: 740 }}>
      <Link to="/" className="back-link">&larr; Back to Yearbook</Link>
      <h1 className="page-title">{isTerms ? 'Terms of Service' : 'Privacy Policy'}</h1>
      <p className="page-subtitle">Effective Date: April 8, 2026</p>

      {isTerms ? <TermsContent /> : <PrivacyContent />}

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--dark-border)', fontSize: 13, color: 'var(--gray)' }}>
        <p>See also: <Link to={isTerms ? '/privacy' : '/terms'}>{isTerms ? 'Privacy Policy' : 'Terms of Service'}</Link></p>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="legal-body">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Sharks Yearbook website at sharks-highlights-client.onrender.com
          (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not
          agree to these Terms, do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          Sharks Yearbook is an unofficial, fan-created website that aggregates and displays publicly
          available San Jose Sharks highlight clips from the 2025-26 NHL season. The Service also
          allows users to sign a virtual yearbook, browse player profiles and statistics, and view
          curated highlight content posted to third-party platforms including TikTok.
        </p>
        <p>
          This Service is not affiliated with, endorsed by, or sponsored by the National Hockey League
          ("NHL"), the San Jose Sharks, or any of their affiliates.
        </p>
      </section>

      <section>
        <h2>3. User Eligibility</h2>
        <p>
          You must be at least 13 years of age to use the Service. By using the Service, you represent
          that you meet this age requirement. If you are under 18, you represent that you have your
          parent or guardian's consent to use the Service.
        </p>
      </section>

      <section>
        <h2>4. User-Submitted Content</h2>
        <p>
          The Service allows you to submit content, including yearbook signatures consisting of a
          display name, a written message, and a selected favorite highlight ("User Content"). By
          submitting User Content, you:
        </p>
        <ul>
          <li>Grant us a non-exclusive, royalty-free, perpetual license to display your User Content on the Service.</li>
          <li>Represent that your User Content does not infringe the rights of any third party.</li>
          <li>Acknowledge that your User Content will be publicly visible to all visitors of the Service.</li>
          <li>Agree not to submit content that is unlawful, defamatory, obscene, harassing, or otherwise objectionable.</li>
        </ul>
        <p>
          We reserve the right to remove any User Content at our sole discretion, without notice, for
          any reason including content that we determine to be inappropriate or in violation of these Terms.
        </p>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>
          Video highlight clips displayed on the Service are sourced from the NHL's publicly available
          media. All NHL-related trademarks, logos, and video content are the property of the NHL and
          its member clubs. Our use of this content is for non-commercial, fan commentary purposes.
        </p>
        <p>
          The design, layout, and original code of the Service are owned by the Service operator. You
          may not reproduce, distribute, or create derivative works from the Service without our
          written permission.
        </p>
      </section>

      <section>
        <h2>6. Third-Party Services</h2>
        <p>
          The Service integrates with third-party platforms, including but not limited to TikTok (for
          content sharing) and Brightcove (for video playback). Your use of features involving
          third-party services is subject to those services' own terms and privacy policies. We are
          not responsible for the practices or content of any third-party services.
        </p>
        <p>
          If you connect your TikTok account to the Service, you authorize us to publish highlight
          clips to your account on your behalf. You may revoke this access at any time through your
          TikTok account settings.
        </p>
      </section>

      <section>
        <h2>7. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
          <li>Attempt to interfere with, compromise, or disrupt the Service or its infrastructure.</li>
          <li>Scrape, crawl, or use automated means to access the Service without our express permission.</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
          <li>Use the Service to transmit spam, malware, or other harmful content.</li>
        </ul>
      </section>

      <section>
        <h2>8. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE
          WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE OPERATOR SHALL NOT BE LIABLE
          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
          PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, ARISING OUT OF YOUR USE OF
          OR INABILITY TO USE THE SERVICE.
        </p>
      </section>

      <section>
        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless the Service operator from any claims, damages,
          losses, or expenses (including reasonable attorneys' fees) arising out of your use of the
          Service, your User Content, or your violation of these Terms.
        </p>
      </section>

      <section>
        <h2>11. Modifications to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be effective immediately
          upon posting the revised Terms on the Service with an updated effective date. Your continued
          use of the Service after any changes constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <p>
          We may suspend or terminate your access to the Service at any time, without prior notice or
          liability, for any reason, including if you breach these Terms. Upon termination, your right
          to use the Service will immediately cease.
        </p>
      </section>

      <section>
        <h2>13. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of
          California, without regard to its conflict of law provisions. Any disputes arising under
          these Terms shall be subject to the exclusive jurisdiction of the courts located in Santa
          Clara County, California.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          For questions about these Terms, contact us via the project's
          GitHub repository at <a href="https://github.com/jagjothbhullar/sharks-highlights" target="_blank" rel="noopener noreferrer">github.com/jagjothbhullar/sharks-highlights</a>.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="legal-body">
      <section>
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy describes how the Sharks Yearbook website at
          sharks-highlights-client.onrender.com (the "Service") collects, uses, and protects your
          information. By using the Service, you consent to the practices described in this policy.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>

        <h3>2.1 Information You Provide</h3>
        <ul>
          <li>
            <strong>Yearbook Signatures:</strong> When you sign a player's yearbook, we collect the
            display name you enter, your written message, and your selected favorite highlight. This
            information is stored in our database and is publicly visible on the Service.
          </li>
        </ul>

        <h3>2.2 Information Collected Through Third-Party Services</h3>
        <ul>
          <li>
            <strong>TikTok:</strong> If you authorize the Service to connect to your TikTok account,
            we receive an access token and your TikTok display name and user ID. This information is
            used solely to publish highlight clips to your TikTok account on your behalf. We do not
            access your TikTok messages, followers list, or any content beyond what is required for
            video publishing.
          </li>
        </ul>

        <h3>2.3 Information Collected Automatically</h3>
        <ul>
          <li>
            <strong>Server Logs:</strong> Our hosting provider (Render) may collect standard server
            logs including IP addresses, browser type, and pages visited. We do not use this data for
            tracking or profiling.
          </li>
        </ul>

        <h3>2.4 Information We Do Not Collect</h3>
        <ul>
          <li>We do not collect email addresses, passwords, phone numbers, or payment information.</li>
          <li>We do not use cookies for tracking, advertising, or analytics.</li>
          <li>We do not use any third-party analytics services (e.g., Google Analytics).</li>
          <li>Emoji reactions and similar interactions are stored in your browser's local storage only and are never transmitted to our servers.</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To display yearbook signatures on player profiles.</li>
          <li>To publish highlight clips to TikTok on behalf of authorized users.</li>
          <li>To operate and maintain the Service.</li>
        </ul>
        <p>We do not use your information for advertising, marketing, or profiling purposes.</p>
      </section>

      <section>
        <h2>4. How We Share Your Information</h2>
        <p>
          We do not sell, rent, or trade your personal information to any third party. Your information
          may be shared in the following limited circumstances:
        </p>
        <ul>
          <li>
            <strong>Public Display:</strong> Yearbook signatures (display name, message, and selected
            highlight) are publicly visible to all visitors of the Service.
          </li>
          <li>
            <strong>Service Providers:</strong> We use Render for hosting and PostgreSQL for database
            storage. These providers may process your data as necessary to provide their services,
            subject to their own privacy policies.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose your information if required to do so
            by law or in response to valid legal process.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>
          Yearbook signatures are retained indefinitely as part of the season archive. TikTok access
          tokens are retained only for as long as the authorization is active and are deleted when
          access is revoked. Server logs are retained according to our hosting provider's standard
          retention policies.
        </p>
      </section>

      <section>
        <h2>6. Data Security</h2>
        <p>
          We implement reasonable technical and organizational measures to protect your information
          against unauthorized access, alteration, disclosure, or destruction. However, no method of
          electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the following rights:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Deletion:</strong> Request that we delete your yearbook signatures or other personal data.</li>
          <li><strong>Revocation:</strong> Revoke TikTok authorization at any time through your TikTok account settings or by contacting us.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us via the GitHub repository listed below. We will
          respond to requests within 30 days.
        </p>
      </section>

      <section>
        <h2>8. Children's Privacy</h2>
        <p>
          The Service is not directed to children under the age of 13. We do not knowingly collect
          personal information from children under 13. If you believe a child under 13 has provided
          us with personal information, please contact us and we will promptly delete it.
        </p>
      </section>

      <section>
        <h2>9. Third-Party Links and Services</h2>
        <p>
          The Service may contain links to third-party websites or integrate with third-party services
          (including TikTok, the NHL, and Brightcove). We are not responsible for the privacy practices
          of these third parties. We encourage you to review the privacy policies of any third-party
          services you interact with.
        </p>
      </section>

      <section>
        <h2>10. California Privacy Rights</h2>
        <p>
          If you are a California resident, you have the right to request information about the
          categories of personal information we have shared with third parties for their direct
          marketing purposes during the preceding calendar year. As stated above, we do not share
          personal information with third parties for marketing purposes.
        </p>
      </section>

      <section>
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated effective date. Your continued use of the Service after any changes
          constitutes acceptance of the revised policy.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          For questions or concerns about this Privacy Policy, or to exercise your data rights,
          contact us via the project's GitHub repository
          at <a href="https://github.com/jagjothbhullar/sharks-highlights" target="_blank" rel="noopener noreferrer">github.com/jagjothbhullar/sharks-highlights</a>.
        </p>
      </section>
    </div>
  );
}
