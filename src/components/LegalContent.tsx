import React from 'react';

export const PrivacyContent: React.FC = () => {
  return (
    <div className="prose prose-slate max-w-none text-slate-700">
      <h2 className="font-serif text-3xl mb-2 mt-0 text-slate-900">Privacy Policy</h2>
      <p className="text-slate-500 text-sm mb-8">Last updated: October 27, 2024</p>
      
      <h3 className="text-slate-800">1. Introduction</h3>
      <p>
        At K&M ERA ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. 
        This privacy policy will inform you as to how we look after your personal data when you visit our website 
        (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
      </p>

      <h3 className="text-slate-800">2. The Data We Collect</h3>
      <p>
        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
      </p>
      <ul>
        <li><strong className="text-slate-800">Identity Data</strong> includes wallet addresses and usernames.</li>
        <li><strong className="text-slate-800">Memorial Data</strong> includes information, images, and stories you upload to create memorials.</li>
        <li><strong className="text-slate-800">Usage Data</strong> includes information about how you use our website and services.</li>
      </ul>

      <h3 className="text-slate-800">3. How We Use Your Data</h3>
      <p>
        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
      </p>
      <ul>
        <li>To provide the memorial services you have requested.</li>
        <li>To manage our relationship with you.</li>
        <li>To improve our website, services, and customer experiences.</li>
        <li>To maintain the security of our platform.</li>
      </ul>

      <h3 className="text-slate-800">4. Blockchain Data</h3>
      <p>
        Please note that any data you choose to store on the blockchain (including memorial details and transactions) is public, 
        immutable, and cannot be deleted or altered by us. By using our blockchain features, you acknowledge and consent to this 
        public availability.
      </p>

      <h3 className="text-slate-800">5. Data Security</h3>
      <p>
        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, 
        or accessed in an unauthorized way, altered, or disclosed.
      </p>

      <h3 className="text-slate-800">6. Contact Us</h3>
      <p>
        If you have any questions about this privacy policy or our privacy practices, please contact us at support@kmera.io.
      </p>
    </div>
  );
};

export const TermsContent: React.FC = () => {
  return (
    <div className="prose prose-slate max-w-none text-slate-700">
      <h2 className="font-serif text-3xl mb-2 mt-0 text-slate-900">Terms of Service</h2>
      <p className="text-slate-500 text-sm mb-8">Last updated: October 27, 2024</p>

      <h3 className="text-slate-800">1. Agreement to Terms</h3>
      <p>
        By accessing our website and using our services, you agree to be bound by these Terms of Service and our Privacy Policy. 
        If you do not agree to these terms, please do not use our services.
      </p>

      <h3 className="text-slate-800">2. User Responsibilities</h3>
      <p>
        You are responsible for your use of the services and for any content you provide, including compliance with applicable laws. 
        Content on the services may be protected by others' intellectual property rights. Please do not copy, upload, download, 
        or share content unless you have the right to do so.
      </p>
      
      <h3 className="text-slate-800">3. Blockchain Transactions</h3>
      <p>
        K&M ERA interacts with the Solana blockchain. We do not control the blockchain and cannot reverse transactions or 
        recover lost keys. You are solely responsible for managing your wallet and cryptographic keys.
      </p>

      <h3 className="text-slate-800">4. Content Guidelines</h3>
      <p>
        We strive to maintain a respectful environment for memorializing loved ones. We reserve the right to remove any content 
        that is offensive, illegal, or violates the rights of others.
      </p>

      <h3 className="text-slate-800">5. Disclaimer of Warranties</h3>
      <p>
        Our services are provided "as is." K&M ERA and its suppliers and licensors hereby disclaim all warranties of any kind, 
        express or implied, including, without limitation, the warranties of merchantability, fitness for a particular purpose and non-infringement.
      </p>

      <h3 className="text-slate-800">6. Limitation of Liability</h3>
      <p>
        In no event will K&M ERA, or its suppliers or licensors, be liable with respect to any subject matter of this agreement 
        under any contract, negligence, strict liability or other legal or equitable theory for: (i) any special, incidental or 
        consequential damages; (ii) the cost of procurement for substitute products or services; (iii) for interruption of use 
        or loss or corruption of data.
      </p>
    </div>
  );
};

