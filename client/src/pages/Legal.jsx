import { useLocation, Link } from 'react-router-dom';

export default function Legal() {
  const { pathname } = useLocation();
  const isTerms = pathname === '/terms';

  return (
    <div className="page legal-page" style={{ maxWidth: 740 }}>
      <Link to="/" className="back-link">&larr; Back to Yearbook</Link>
      <h1 className="page-title">{isTerms ? 'Terms of Use' : 'Privacy Policy'}</h1>
      <p className="page-subtitle">Effective Date: April 8, 2026</p>

      {isTerms ? <TermsContent /> : <PrivacyContent />}

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--dark-border)', fontSize: 13, color: 'var(--gray)' }}>
        <p>See also: <Link to={isTerms ? '/privacy' : '/terms'}>{isTerms ? 'Privacy Policy' : 'Terms of Use'}</Link></p>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="legal-body">
      <section>
        <h2>Overview</h2>
        <p>
          This website is owned and operated by Sharks Yearbook ("we," "us," or "our"). These Terms
          of Use ("Terms") govern your use of the Sharks Yearbook website located at
          sharks-highlights-client.onrender.com, including all subdomains and mobile versions
          (collectively, the "Sites"). By using the Sites, you consent to the practices described in
          these Terms. If you do not agree to these Terms, please immediately cease all use of the Sites.
        </p>
        <p>
          Sharks Yearbook is an unofficial fan project and is not affiliated with, endorsed by, or
          sponsored by the National Hockey League ("NHL"), the San Jose Sharks, Sharks Sports &amp;
          Entertainment LLC ("SSE"), or any of their affiliates.
        </p>
      </section>

      <section>
        <h2>Additional Agreements &amp; Third Parties</h2>
        <p>
          These Terms apply only to the portions of the Sites operated by us. Third-party service
          providers may host portions of the Sites, and you may access third parties through links
          on the Sites. Third parties are not governed by these Terms. We disclaim responsibility for
          any third-party content, products, or services. You expressly agree to hold us harmless from
          any claims arising from your interactions with third parties.
        </p>
      </section>

      <section>
        <h2>Representations</h2>
        <p>
          As a condition of your right to use the Sites, you represent that you are of legal age to
          enter into a binding contract and that you are not a person barred from accessing the Sites
          under the laws of the United States or any other country.
        </p>
      </section>

      <section>
        <h2>Restricted Activities</h2>
        <p>You may not engage in the following activities on or through the Sites:</p>
        <ul>
          <li>Violating any applicable laws or encouraging others to do so.</li>
          <li>Collecting personal data of other users without their consent.</li>
          <li>Sending or posting unlawful, defamatory, abusive, sexually explicit, threatening, vulgar, obscene, or profane content.</li>
          <li>Infringing any patent, trademark, copyright, trade secret, or privacy right of any party.</li>
          <li>Distributing spam, junk mail, pyramid schemes, or unsolicited solicitations.</li>
          <li>Disrupting the security of, or otherwise interfering with, the Sites or their infrastructure.</li>
          <li>Damaging the integrity of the Sites through viruses, denial-of-service attacks, or spoofing.</li>
          <li>Storing or transmitting harmful code, viruses, worms, or Trojan horses.</li>
          <li>Using false identities or misrepresenting your affiliation with any person or entity.</li>
          <li>Obtaining unauthorized access to restricted portions of the Sites.</li>
          <li>Reverse engineering any software used by the Sites.</li>
          <li>Interfering with any third party's use of the Sites.</li>
          <li>Assisting others in any of the above activities.</li>
        </ul>
        <p>Additionally, without our written consent, you may not:</p>
        <ul>
          <li>Reproduce, duplicate, or exploit content from the Sites for commercial purposes.</li>
          <li>Use automated means such as robots, scrapers, or scripts to access or monitor the Sites.</li>
          <li>Deep-link to the Sites or create pop-up windows over them.</li>
          <li>Access the Sites to build a competing service or for benchmarking purposes.</li>
        </ul>
      </section>

      <section>
        <h2>Disclaimer of Warranties and Limitation of Liability</h2>
        <p>
          YOUR USE OF THE SITES IS AT YOUR SOLE RISK. THE SITES AND ALL CONTENT, PRODUCTS, AND
          SERVICES OFFERED THROUGH THE SITES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS.
          WE EXPRESSLY DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT
          LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT.
        </p>
        <p>
          UNDER NO CIRCUMSTANCES WILL WE BE LIABLE TO YOU OR TO ANY PERSON OR ENTITY CLAIMING THROUGH
          YOU FOR ANY LOSS, INJURY, LIABILITY, OR DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR
          ACCESS TO, USE OF, INABILITY TO USE, OR RELIANCE ON THE SITES OR ANY CONTENT, PRODUCT, OR
          SERVICE PROVIDED TO YOU THROUGH OR IN CONNECTION WITH THE SITES. THIS IS A COMPREHENSIVE
          LIMITATION OF LIABILITY THAT APPLIES TO ALL LOSSES AND DAMAGES OF ANY KIND, WHETHER DIRECT,
          INDIRECT, GENERAL, SPECIAL, INCIDENTAL, CONSEQUENTIAL, EXEMPLARY, OR OTHERWISE, INCLUDING
          WITHOUT LIMITATION LOSS OF DATA, GOODWILL, REVENUE, OR PROFITS.
        </p>
        <p>
          THIS LIMITATION APPLIES REGARDLESS OF THE ALLEGED BASIS OF LIABILITY, WHETHER IN CONTRACT,
          NEGLIGENCE, TORT, STRICT LIABILITY, OR OTHERWISE, AND EVEN IF WE HAVE BEEN ADVISED OF OR
          SHOULD HAVE KNOWN OF THE POSSIBILITY OF SUCH DAMAGES. IF ANY LIMITATION ON REMEDIES,
          DAMAGES, OR LIABILITY IS FOUND TO BE INVALID, OUR AGGREGATE LIABILITY SHALL NOT EXCEED ONE
          HUNDRED U.S. DOLLARS ($100.00).
        </p>
        <p>
          SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR
          EXCLUSION OF LIABILITY FOR CERTAIN TYPES OF DAMAGES. ACCORDINGLY, SOME OF THE ABOVE
          DISCLAIMERS AND LIMITATIONS MAY NOT APPLY TO YOU.
        </p>
        <p>
          You acknowledge that there may be unknown claims and expressly waive rights under California
          Civil Code Section 1542, which states: "A general release does not extend to claims that
          the creditor or releasing party does not know or suspect to exist in his or her favor at the
          time of executing the release and that, if known by him or her, would have materially
          affected his or her settlement with the debtor or released party."
        </p>
      </section>

      <section>
        <h2>Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from any claim or demand, including reasonable
          attorney's fees and costs, made by any third party due to or arising out of your posting of
          any content on the Sites, or other use of the Sites in a manner not permitted by these Terms.
        </p>
      </section>

      <section>
        <h2>Site Content</h2>
        <p>
          Content available on the Sites &mdash; including text, images, links, audio, video, and other
          material &mdash; may be owned by us, our partners, or licensed by third parties. All rights are
          reserved. Video highlight clips displayed on the Sites are sourced from the NHL's publicly
          available media. All NHL-related trademarks, logos, and video content are the property of the
          NHL and its member clubs.
        </p>
        <p>
          Any use of content on the Sites, including without limitation reproduction, modification,
          distribution, replication, any form of data extraction or data mining, or other commercial
          exploitation of any kind, without our prior written permission, is strictly prohibited.
        </p>
      </section>

      <section>
        <h2>Claims of Copyright Infringement</h2>
        <p>
          If you believe content on the Sites infringes your copyright, please contact us. Alleged
          infringement notices should be sent to the contact information listed below and must include:
        </p>
        <ul>
          <li>Your name, address, telephone number, and email address.</li>
          <li>A statement under penalty of perjury of copyright ownership or authorization.</li>
          <li>A description of the copyrighted work and the infringing material, including its URL on the Sites.</li>
          <li>A good-faith statement that the use lacks authorization from the copyright owner.</li>
          <li>A statement confirming the truthfulness of the information provided.</li>
        </ul>
      </section>

      <section>
        <h2>User-Submitted Content</h2>
        <p>
          Any content uploaded, posted, submitted, or otherwise made available by individual users of the
          Sites, including without limitation yearbook signatures, comments, and other content which does
          not originate with us ("User Content"), is the sole responsibility of the person who made such
          User Content available. We bear no liability for User Content and do not guarantee its
          truthfulness, integrity, suitability, or quality, nor do we endorse it.
        </p>
        <p>
          User Content authors retain ownership. However, by submitting User Content to the Sites, you
          grant us an irrevocable, nonexclusive, perpetual, royalty-free, transferable, sublicensable,
          worldwide license to copy, reproduce, modify, publish, display, distribute, perform, exploit,
          and prepare derivative works of such User Content in any manner, media, or format now existing
          or hereafter devised, without any obligation of notice, attribution, or compensation to you.
        </p>
        <p>
          We reserve the right in our sole discretion to pre-screen, edit, refuse, move, or remove
          User Content without obligation. The exercise of this discretion shall not convert User Content
          to content owned or provided by us, and the user who submitted such content retains ownership.
        </p>
        <p>
          California law permits minors under eighteen to request content deletion. Please contact us
          using the information below to submit such requests, including (i) your name, (ii) a
          description of the material, and (iii) its location on the Sites. Please be aware that
          fulfillment of this request does not ensure complete or comprehensive removal of the content.
        </p>
      </section>

      <section>
        <h2>Modifications and Interruption to Sites</h2>
        <p>
          We reserve the right to modify or discontinue all or any portion of the Sites with or without
          notice to you. We will not be liable if we choose to exercise this right. We do not guarantee
          continuous, uninterrupted, or secure access, or error-free operation. We may restrict
          availability, scope, or access at our sole discretion and without prior notice or liability.
        </p>
      </section>

      <section>
        <h2>Third-Party Services &mdash; TikTok</h2>
        <p>
          The Sites integrate with TikTok for content sharing. If you connect your TikTok account to the
          Sites, you authorize us to publish highlight clips to your account on your behalf. Your use of
          TikTok features is subject to TikTok's own terms of service and privacy policy. You may revoke
          this authorization at any time through your TikTok account settings. We are not responsible for
          the practices or content of TikTok or any other third-party platform.
        </p>
      </section>

      <section>
        <h2>Dispute Resolution</h2>
        <p>
          Any dispute arising out of or relating in any way to your use of the Sites or any products,
          services, or information you receive through the Sites shall be submitted to confidential,
          binding arbitration in San Jose, California before one arbitrator. The arbitrator's award shall
          be final, binding, and enforceable as a court judgment. No arbitration may be combined with
          another related arbitration.
        </p>
        <p>
          Regarding intellectual property violations, we may seek injunctive or appropriate relief in
          the courts of Santa Clara County, California, and you consent to exclusive jurisdiction there.
          All disputes shall proceed on an individual basis only, not as class, consolidated, or
          representative actions. You waive any right to a jury trial in any court proceedings.
        </p>
      </section>

      <section>
        <h2>Governing Law</h2>
        <p>
          The laws of the State of California and the United States govern these Terms and any claims
          arising out of or relating to use of the Sites, without giving effect to any choice-of-law
          rules. Except for matters subject to arbitration, the state and federal courts located in
          Santa Clara County, California shall be the exclusive venue for any claims or actions.
        </p>
      </section>

      <section>
        <h2>Compliance with Laws</h2>
        <p>
          You assume all knowledge of applicable law and are responsible for compliance with any such
          laws. You may not use the Sites in any way that violates applicable state, federal, or
          international laws, regulations, or other government requirements.
        </p>
      </section>

      <section>
        <h2>Civil Code Section 1789.3</h2>
        <p>
          California residents receive this consumer rights notice per California Civil Code Section
          1789.3: The Complaint Assistance Unit of the Division of Consumer Services of the California
          Department of Consumer Affairs may be reached at 1625 North Market Blvd., Suite N112,
          Sacramento, CA 95834, or by telephone at (800) 952-5210.
        </p>
      </section>

      <section>
        <h2>Changes to These Terms</h2>
        <p>
          We reserve the right, at any time, to modify, alter, or update these Terms without prior
          notice. You are encouraged to check this page regularly for changes. Modifications will become
          effective immediately upon being posted to the Sites. Your continued use of the Sites after
          such modifications constitutes your acknowledgement and acceptance of the modified Terms.
        </p>
      </section>

      <section>
        <h2>Miscellaneous</h2>
        <p>
          These Terms contain the entire understanding of the parties regarding their subject matter
          and supersede all prior agreements. No failure or delay in exercising rights operates as a
          waiver. If any provision is found unlawful, void, or unenforceable, the remaining provisions
          remain valid and enforceable. Regardless of any statute or law to the contrary, any claim or
          cause of action arising out of or related to use of the Sites must be filed within one (1)
          year after such claim arose or be forever barred. We will not be liable for any failure or
          deficiency in the performance or availability of the Sites by reason of any event beyond our
          reasonable control, including without limitation labor disturbances, Internet outages,
          communication failures, fire, terrorism, natural disasters, or war.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions regarding these Terms may be directed to us via the project's GitHub repository
          at <a href="https://github.com/jagjothbhullar/sharks-highlights" target="_blank" rel="noopener noreferrer">github.com/jagjothbhullar/sharks-highlights</a>.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="legal-body">
      <section>
        <h2>Introduction</h2>
        <p>
          Sharks Yearbook ("we," "our," "us") respects your privacy and values your trust and
          confidence. This Privacy Policy applies to the Sharks Yearbook website located at
          sharks-highlights-client.onrender.com and other authorized online services that link to or
          post this Privacy Policy (collectively, the "Services"), and explains how we collect, use,
          and disclose information through the Services.
        </p>
        <p>
          Please note that this Privacy Policy does not apply to any information that is collected or
          obtained through sites or services that do not link to this Privacy Policy, including but
          not limited to the websites, apps, or services of the National Hockey League ("NHL") or any
          of its member clubs. If you provide information to us on a third-party site or platform, the
          information you provide may be separately collected by that third-party site or platform and
          is subject to the third party's privacy practices.
        </p>
        <p>
          By using our Services, you agree to the terms of this Privacy Policy. If you do not agree
          with this Privacy Policy, you cannot use the Services.
        </p>
      </section>

      <section>
        <h2>1. Information We Collect and Receive</h2>
        <p>
          We may collect information that identifies, relates to, describes, references, is reasonably
          capable of being associated with, or could reasonably be linked, directly or indirectly, with
          a particular consumer, household, or device ("personal information"). We collect the following
          categories of personal information:
        </p>

        <h3>Information You Provide Directly</h3>
        <ul>
          <li>
            <strong>Yearbook Signatures:</strong> When you sign a player's yearbook, we collect the
            display name you enter, your written message, and your selected favorite highlight. This
            information is stored in our database and is publicly visible on the Services.
          </li>
        </ul>

        <h3>Information Collected Through Third-Party Services</h3>
        <ul>
          <li>
            <strong>TikTok:</strong> If you authorize the Services to connect to your TikTok account,
            we receive an access token and your TikTok display name and user ID through the TikTok API.
            This information is used solely to publish highlight clips to your TikTok account on your
            behalf. We do not access your TikTok messages, followers list, or any content beyond what is
            required for video publishing. You may revoke this access at any time through your TikTok
            account settings.
          </li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <ul>
          <li>
            <strong>Log Information:</strong> Our hosting provider (Render) may automatically collect
            standard server logs including Internet Protocol ("IP") addresses, browser type, operating
            system, and pages visited. We do not use this data for tracking, profiling, or advertising.
          </li>
          <li>
            <strong>Device Information:</strong> The type of device you use to access the Services and
            certain device identifiers may be collected automatically by our hosting infrastructure.
          </li>
        </ul>

        <h3>Information We Do Not Collect</h3>
        <ul>
          <li>We do not collect email addresses, passwords, phone numbers, or payment information.</li>
          <li>We do not use cookies for tracking, advertising, or analytics.</li>
          <li>We do not use any third-party analytics services (e.g., Google Analytics).</li>
          <li>We do not collect location data from your device.</li>
          <li>Emoji reactions and similar on-site interactions are stored solely in your browser's local storage and are never transmitted to our servers.</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use the Information We Collect</h2>
        <p>We may use the information we collect for the following purposes:</p>

        <h3>To Provide Our Services</h3>
        <ul>
          <li>Display yearbook signatures on player profiles.</li>
          <li>Publish highlight clips to TikTok on behalf of authorized users.</li>
          <li>Operate, maintain, and improve the Services.</li>
          <li>Detect and prevent fraud or potentially illegal activities.</li>
        </ul>

        <p>
          We do not use your information for advertising, marketing, or profiling purposes. We will not
          collect additional categories of personal information or use the personal information we
          collected for materially different, unrelated, or incompatible purposes without providing
          you notice.
        </p>
      </section>

      <section>
        <h2>3. How We Share the Information We Collect</h2>
        <p>
          We do not sell, rent, or trade your personal information to any third party. Your information
          may be shared in the following limited circumstances:
        </p>
        <ul>
          <li>
            <strong>Public Display:</strong> Yearbook signatures (display name, message, and selected
            highlight) are publicly visible to all visitors of the Services.
          </li>
          <li>
            <strong>Service Providers:</strong> We use Render for hosting and PostgreSQL for database
            storage. These service providers may process your data as necessary to provide their
            services, subject to their own privacy policies. They are contractually limited in the ways
            in which they may use this information.
          </li>
          <li>
            <strong>TikTok:</strong> When you authorize TikTok integration, we transmit video content
            and metadata to TikTok's API on your behalf, subject to TikTok's privacy policy.
          </li>
          <li>
            <strong>Legal Process:</strong> We may disclose your information when we have a good-faith
            belief that doing so is necessary to respond to lawful governmental requests or legal
            process, when the information is relevant to a crime, when an emergency poses a threat to
            safety, or to protect our rights or enforce these Terms.
          </li>
          <li>
            <strong>Business Transactions:</strong> In the event of a change of ownership, your
            information may be transferred to another entity.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Data Retention</h2>
        <p>
          We store your personal information for no longer than necessary for the purposes for which
          it was collected, including for the purposes of satisfying any legal or reporting requirements,
          and in accordance with our legal obligations and legitimate business interests.
        </p>
        <ul>
          <li>Yearbook signatures are retained indefinitely as part of the season archive.</li>
          <li>TikTok access tokens are retained only for as long as the authorization is active and are deleted when access is revoked.</li>
          <li>Server logs are retained according to our hosting provider's standard retention policies.</li>
        </ul>
      </section>

      <section>
        <h2>5. Security</h2>
        <p>
          We have adopted physical, technical, and administrative safeguards to help protect against
          loss, misuse, and unauthorized access to or disclosure of the information you provide to us.
          However, no data transmission or storage can be guaranteed to be 100% secure. As a result,
          while we strive to protect your information and privacy, we cannot and do not guarantee or
          warrant the security of any information you disclose or transmit to our Services and cannot
          be responsible for the theft, destruction, or inadvertent disclosure of your information, or
          any other disclosures out of our control.
        </p>
      </section>

      <section>
        <h2>6. Children's Privacy</h2>
        <p>
          We do not knowingly collect, use, or disclose personal information from children under the
          age of 13. If we are made aware that we have collected personal information from a child
          under 13 years old in a manner that is inconsistent with the Children's Online Privacy
          Protection Act ("COPPA"), we will delete this information as soon as possible. If you believe
          we have collected personal information from a child under 13, please contact us using the
          information below.
        </p>
      </section>

      <section>
        <h2>7. Third-Party Links</h2>
        <p>
          Our Services may contain links to other sites that we do not own or operate, including but
          not limited to TikTok, the NHL, and Brightcove. We provide links to third-party services as
          a convenience. These links are not intended as an endorsement of or referral to the linked
          services. The linked services have separate and independent privacy statements, notices, and
          terms of use, which we recommend you read carefully. We have no control over such services
          and therefore have no responsibility or liability for the manner in which they may collect,
          use, disclose, secure, or otherwise treat your information.
        </p>
      </section>

      <section>
        <h2>8. Your Choices and Rights</h2>
        <p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Deletion:</strong> Request that we delete your yearbook signatures or other personal data.</li>
          <li><strong>Correction:</strong> Request that we correct inaccuracies in your personal data.</li>
          <li><strong>Revocation:</strong> Revoke TikTok authorization at any time through your TikTok account settings or by contacting us.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us using the information below. We will respond to
          requests within 30 days.
        </p>
      </section>

      <section>
        <h2>9. Your California Privacy Rights</h2>
        <p>
          The California Consumer Privacy Act ("CCPA") provides California residents with specific
          rights regarding their personal information.
        </p>

        <h3>Access and Data Portability</h3>
        <p>
          You have the right to request that we disclose certain information about our collection and
          use of your personal information over the past 12 months, including the categories collected,
          the sources, our business purpose for collecting it, and the categories of third parties with
          whom we share it.
        </p>

        <h3>Deletion Rights</h3>
        <p>
          You have the right to request that we delete any of your personal information that we
          collected from you and retained, subject to certain exceptions. We may deny your deletion
          request if retaining the information is necessary to complete a transaction, detect security
          incidents, comply with a legal obligation, or make other lawful internal uses compatible with
          the context in which you provided it.
        </p>

        <h3>Exercising Your Rights</h3>
        <p>
          To exercise the access, data portability, or deletion rights described above, please submit
          a verifiable consumer request to us through the contact information below. Only you, or
          someone legally authorized to act on your behalf, may make a request related to your personal
          information. You may make a request for access or data portability no more than twice within a
          12-month period. We endeavor to respond within forty-five (45) days.
        </p>

        <h3>Non-Discrimination</h3>
        <p>
          We will not discriminate against you for exercising any of your CCPA rights. We will not deny
          you services, charge you different prices, or provide you a different level or quality of
          service for exercising your rights.
        </p>

        <h3>Sale of Personal Information</h3>
        <p>
          We do not sell the personal information of our users. We do not sell the personal information
          of consumers we actually know are less than 16 years of age.
        </p>

        <p>
          California Civil Code Section 1798.83 permits California residents to request certain
          information regarding our disclosure of personal information to third parties for their direct
          marketing purposes. As stated above, we do not share personal information with third parties
          for marketing purposes.
        </p>
      </section>

      <section>
        <h2>10. "Do Not Track" Signals</h2>
        <p>
          Some web browsers may transmit "do not track" signals to websites. Because we do not use
          cookies for tracking or advertising, our Services respond equivalently regardless of whether
          a "do not track" signal is received.
        </p>
      </section>

      <section>
        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We reserve the right to amend this Privacy Policy at our discretion and at any time. When we
          make changes, we will post the updated policy on the Services and update the effective date.
          Your continued use of the Services following the posting of changes constitutes your
          acceptance of such changes.
        </p>
      </section>

      <section>
        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, or to exercise
          your data rights, please contact us via the project's GitHub repository
          at <a href="https://github.com/jagjothbhullar/sharks-highlights" target="_blank" rel="noopener noreferrer">github.com/jagjothbhullar/sharks-highlights</a>.
        </p>
      </section>
    </div>
  );
}
