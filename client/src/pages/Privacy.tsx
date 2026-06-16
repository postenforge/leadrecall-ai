export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: June 15, 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
            <p>
              LeadRecall AI ("we," "our," or "us") operates an automated missed-call text-back
              service for local businesses. This Privacy Policy explains how we collect, use, and
              protect information when you interact with our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Information We Collect</h2>
            <p>When you call a business phone number powered by LeadRecall AI, we may collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your phone number (from caller ID)</li>
              <li>The date and time of your call</li>
              <li>Text message content exchanged during the conversation</li>
              <li>Information you voluntarily provide via text (e.g., name, appointment preferences)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Your Information</h2>
            <p>We use the information collected to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send you a text message acknowledging your missed call</li>
              <li>Facilitate a text-based conversation to address your inquiry</li>
              <li>Schedule appointments or callbacks on behalf of the business</li>
              <li>Improve our service quality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. Information Sharing</h2>
            <p>
              We share your information only with the business you called so they can follow up on
              your inquiry. We do not sell, rent, or share your personal information with third
              parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Data Retention</h2>
            <p>
              We retain conversation data for up to 90 days to ensure continuity of service. After
              this period, data is automatically deleted unless required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Opting Out</h2>
            <p>
              You can stop receiving messages at any time by replying <strong>STOP</strong> to any
              text message from our service. You may also text <strong>HELP</strong> for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">7. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information,
              including encryption in transit and at rest. However, no method of electronic
              transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to request deletion of your
              data, please contact us at:{" "}
              <a href="mailto:privacy@leadrecallai.com" className="text-blue-400 hover:underline">
                privacy@leadrecallai.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
