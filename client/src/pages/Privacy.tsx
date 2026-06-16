export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: June 16, 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
            <p>
              LeadRecall AI ("we," "our," or "us") operates an automated missed-call text-back
              service for local businesses. This Privacy Policy explains how we collect, use, and
              protect information when you interact with our service, including our SMS messaging
              practices.
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

          <section id="sms-privacy">
            <h2 className="text-xl font-semibold text-white mb-2">4. SMS Messaging Practices</h2>
            <p className="mb-3">
              <strong className="text-white">Consent:</strong> When you call a LeadRecall AI-powered
              business phone number, you hear an automated greeting that discloses: "We will send you
              a text message to help with your inquiry." By remaining on the line, you provide express
              consent to receive SMS messages related to your call.
            </p>
            <p className="mb-3">
              <strong className="text-white">Message Frequency:</strong> Message frequency varies based
              on your interaction. Typically 1-10 messages per conversation. No recurring promotional
              messages are sent.
            </p>
            <p className="mb-3">
              <strong className="text-white">Message and Data Rates:</strong> Standard message and data
              rates may apply depending on your mobile carrier plan.
            </p>
            <p className="mb-3">
              <strong className="text-white">Opt-Out:</strong> Reply STOP to any message to stop
              receiving texts. Reply HELP for assistance.
            </p>
            <p>
              <strong className="text-white">No Sharing:</strong> We do not share, sell, or use your
              phone number or SMS data for marketing purposes. Your phone number and message content
              are shared only with the specific business you called.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">5. Information Sharing</h2>
            <p>
              We share your information only with the business you called so they can follow up on
              your inquiry. We do not sell, rent, or share your personal information with third
              parties for marketing purposes. We do not share mobile information with third parties
              or affiliates for marketing or promotional purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">6. Data Retention</h2>
            <p>
              We retain conversation data for up to 90 days to ensure continuity of service. After
              this period, data is automatically deleted unless required by law.
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
              If you have questions about this Privacy Policy, our SMS practices, or wish to request
              deletion of your data, please contact us at:{" "}
              <a href="mailto:privacy@leadrecallai.com" className="text-blue-400 hover:underline">
                privacy@leadrecallai.com
              </a>
            </p>
            <p className="mt-2">
              LeadRecall AI<br />
              Houston, TX
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
