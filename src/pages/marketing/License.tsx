import React from "react";

const PrivacyPolicy= () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Effective Date: 24-07-2025</p>
      <p className="mb-4">Smartseyali Tech</p>
      <p className="mb-4">Website: <a href="https://www.smartseyali.com" className="text-blue-600 underline">https://www.smartseyali.com</a></p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <p className="mb-2 font-semibold">a) User-Provided Information</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Name, mobile number, email address</li>
        <li>Business information (company name, business category)</li>
        <li>Message templates and campaigns</li>
        <li>Contact lists and groups created by the user</li>
      </ul>

      <p className="mb-2 font-semibold">b) Automatically Collected Information</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Device information (IP address, browser type)</li>
        <li>Usage data (logs, timestamps, actions taken on the platform)</li>
      </ul>

      <p className="mb-2 font-semibold">c) WhatsApp Meta API Data</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Message delivery reports</li>
        <li>Template status and response</li>
        <li>WhatsApp business phone number and ID</li>
        <li>Message content (only for sending/receiving campaign data, not stored permanently)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To provide and maintain the WhatsApp Business Platform services</li>
        <li>To create and send messaging campaigns</li>
        <li>To generate analytics and improve our platform</li>
        <li>To respond to support requests and user inquiries</li>
        <li>To comply with legal obligations and Meta (WhatsApp) API requirements</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">3. Data Sharing and Disclosure</h2>
      <p className="mb-4">We do <strong>not sell</strong> your personal data. However, we may share data with:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Meta Platforms Inc. for sending messages via WhatsApp Business API</li>
        <li>Cloud providers and service partners for hosting and delivery of services</li>
        <li>Legal authorities when required by law or for compliance</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">4. Data Security</h2>
      <p className="mb-4">
        We implement appropriate technical and organizational measures to protect your data. Access to personal data is limited to authorized personnel only.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">5. Data Retention</h2>
      <p className="mb-4">
        We retain personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law. Message logs are stored temporarily and purged periodically.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">6. User Rights</h2>
      <p className="mb-4">
        Depending on your jurisdiction, you may have rights to:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Access, update, or delete your personal data</li>
        <li>Withdraw consent for certain processing</li>
        <li>File a complaint with a data protection authority</li>
      </ul>
      <p className="mb-4">To exercise these rights, contact us at <strong>[your support email]</strong>.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">7. Children’s Privacy</h2>
      <p className="mb-4">
        Our platform is intended for businesses and is not directed to individuals under the age of 18.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">8. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this policy from time to time. You will be notified of significant changes via our website or email.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Smartseyali Tech</strong></li>
        <li>Email: support@smartseyali.com</li>
        <li>Phone: +91-9047736612</li>
        <li>Website: <a href="https://www.smartseyali.com" className="text-blue-600 underline">https://www.smartseyali.com</a></li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
