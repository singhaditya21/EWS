// Legal and consent text for OmniLearn Labs (Class 1, CBSE & ICSE).
// DRAFT ONLY. Written with India’s Digital Personal Data Protection Act, 2023 in mind, but it has
// not been reviewed by a lawyer. Everything in [SQUARE BRACKETS] is a placeholder to fill in.
// Bump POLICY_VERSION whenever the privacy policy or consent text changes; the version a parent
// agreed to is stored in the `consents` table.

export const POLICY_VERSION = '2026-10-draft-1';

export interface LegalSection {
  heading: string;
  /** Paragraphs or bullet points, as plain strings. */
  body: string[];
}

export const PRIVACY_POLICY: LegalSection[] = [
  {
    heading: 'Draft — needs legal review',
    body: [
      'This privacy policy is a draft. It has not yet been reviewed by a lawyer and must be reviewed by a qualified Indian lawyer before OmniLearn Labs is launched to the public.',
      'Text in [SQUARE BRACKETS] is a placeholder that still has to be filled in.',
    ],
  },
  {
    heading: 'Who we are',
    body: [
      'OmniLearn Labs is a learning app for Class 1 children following the CBSE or ICSE syllabus. It is run by [LEGAL ENTITY NAME], [ADDRESS] (“we”, “us”).',
      'For personal data that parents and teachers give us directly, we decide how and why it is used, so we act as the “Data Fiduciary” under India’s Digital Personal Data Protection Act, 2023 (the “DPDP Act”).',
      'When a school buys a School plan, the school decides how its pupils’ data is used and we handle that data on the school’s behalf, under a separate data processing agreement with the school.',
      'This policy explains what we collect, why, who we share it with, how long we keep it, and the rights you have.',
    ],
  },
  {
    heading: 'The short version',
    body: [
      'The Free plan works without an account. Your child’s progress stays in this browser on this device and is not sent to us.',
      'If you create an account, we keep only what we need to run the app: your phone number or email, your child’s first name and avatar, and their learning progress.',
      'We do not show ads. We do not sell data. We do not track children across other apps or websites, and we do not build profiles of children for advertising.',
      'You can see, correct and delete your child’s data at any time from inside the app.',
    ],
  },
  {
    heading: 'Using OmniLearn Labs without an account (Free plan)',
    body: [
      'On the Free plan, your child’s name, stars, quiz answers and progress are saved only in your browser’s local storage on your device. We do not receive this information.',
      'Clearing your browser data, or using a different device or browser, removes or hides this progress. We cannot recover it for you.',
      'Like any website, when the app loads, our hosting provider receives basic technical information such as your IP address, browser type and the pages requested. This is used only to deliver the app and keep it secure (see “Technical logs” below).',
    ],
  },
  {
    heading: 'What we collect from parents',
    body: [
      'Sign-in details: your mobile number (for a one-time password) or your email address.',
      'Account details: your role (parent, teacher or school admin) and, if you give one, a display name.',
      'Consent records: which version of this policy you agreed to, for which child, how and when, and whether you later withdrew it.',
      'Subscription details: your plan, billing period, subscription status and renewal date, and the reference number Razorpay gives your subscription. We do not receive or store your card, UPI or bank details.',
      'Messages you send us, for example support requests or grievances.',
    ],
  },
  {
    heading: 'What we collect about children',
    body: [
      'We ask for as little as possible about children. A parent creates a child profile with a first name (or nickname) and a picture avatar only. We do not ask for a child’s surname, date of birth, photo, school, address, phone number or email.',
      'Learning progress: lessons finished, stars earned, quiz and practice answers (right or wrong, with the date and time), and which skills need more practice. This is used to show progress reports and to choose practice questions at the right level.',
      'Observations: short notes a parent or teacher chooses to write about a child’s learning. Please keep these about learning only.',
      'Children cannot create accounts, cannot chat with anyone, and cannot post anything that other users can see.',
    ],
  },
  {
    heading: 'Classes and schools',
    body: [
      'Teachers on the Classroom or School plan can create classes. For each child in a class, the teacher enters a first name (or nickname) and an avatar. The child signs in on a classroom device with the class code and a picture password. Children in a class do not have their own accounts.',
      'We store the class name, board (CBSE or ICSE), the children’s names and avatars, their learning progress, lessons assigned by the teacher, and any observations the teacher writes. Picture passwords are stored only in a scrambled (hashed) form.',
      'Before creating a class, the teacher or school must confirm that the school has obtained consent from each child’s parent or guardian. The school is responsible for obtaining and keeping that consent. We record that the confirmation was given.',
      'A child’s class progress is visible to the teacher of that class (and, on a School plan, to authorised school staff). Parents who want to see or delete class data should contact the school first; we will help the school respond.',
    ],
  },
  {
    heading: 'Payments',
    body: [
      'Payments are handled by Razorpay. You enter your card, UPI or bank details on Razorpay’s secure checkout, not on our servers. We never see or store these details.',
      'Razorpay tells us whether a payment or renewal succeeded, so we can turn your plan on or off. Razorpay’s own privacy policy applies to the information you give Razorpay.',
    ],
  },
  {
    heading: 'Weekly email summaries',
    body: [
      'On plans that include it, parents can choose to receive a weekly email summarising each child’s week: questions answered, percentage right, stars earned and lessons finished.',
      'This is optional. You can turn it off at any time in the app or by using the unsubscribe link in the email. Emails are sent through our email provider, Resend.',
    ],
  },
  {
    heading: 'Microphone, speech and voices',
    body: [
      'Some activities let a child say a word aloud to check pronunciation. This uses the speech recognition built into your browser. It only starts when someone taps the microphone button, and your browser will ask for permission first.',
      'We do not record, receive or store the audio. However, in some browsers (including Google Chrome) the browser itself sends the audio to its maker (for example Google) to turn speech into text. That company’s privacy policy applies to that audio. If you do not want this, do not use the microphone activities; everything else in the app works without them.',
      'Read-aloud uses the voices already installed on your device. The text being read is not sent to us.',
    ],
  },
  {
    heading: 'Technical logs',
    body: [
      'Our hosting and database providers keep short-term technical logs (such as IP address, device and browser type, time of request and error messages) to deliver the service, prevent abuse, and investigate security problems.',
      'We do not use these logs to profile children or for advertising. They are kept for [LOG RETENTION PERIOD] unless needed for a security investigation or required by law.',
      'The app also loads fonts and some files from public content delivery networks (Google Fonts and jsDelivr). Your browser connects to these services directly, so they receive your IP address.',
      'We do not use advertising or analytics cookies. The app uses your browser’s local storage to remember progress and settings on your device.',
    ],
  },
  {
    heading: 'Why we use information',
    body: [
      'We use personal data only for these purposes:',
      '• To create and secure your account and sign you in.',
      '• To save your child’s progress and sync it across your devices (paid plans).',
      '• To show progress reports to parents and teachers, and to pick practice questions at the right level for the child.',
      '• To let teachers run classes, assign lessons and see class reports.',
      '• To take payments, manage subscriptions and issue GST invoices.',
      '• To send weekly summaries if you turned them on, and to send important service messages (for example about your subscription or changes to this policy).',
      '• To answer support requests and grievances, keep the service secure, and meet our legal obligations.',
      'We do not use personal data for any other purpose without asking you first.',
    ],
  },
  {
    heading: 'What we never do',
    body: [
      'We do not show advertisements of any kind, and we never show targeted advertising to children.',
      'We do not track children across other websites or apps, and we do not monitor children’s behaviour beyond recording their learning progress inside OmniLearn Labs so that parents and teachers can see it.',
      'We do not sell, rent or trade personal data.',
      'We do not use children’s data to train artificial intelligence models.',
    ],
  },
  {
    heading: 'Parental consent for children',
    body: [
      'Under the DPDP Act, a “child” is anyone under 18. We process a child’s personal data only with the verifiable consent of their parent or lawful guardian.',
      'For family accounts, the parent signs in, confirms they are an adult and the child’s parent or guardian, and gives consent in the app before a child profile can sync. We record the policy version, the method and the time of consent. [VERIFICATION METHOD — to be confirmed with counsel against the DPDP Rules, e.g. a check of the parent’s identity or age details or a DigiLocker token.]',
      'For classes, the school or teacher obtains consent from parents and confirms this to us before creating the class.',
      'You can withdraw consent at any time from the app (by deleting the child profile) or by writing to us. Withdrawing is as easy as giving consent. Once you withdraw, we stop processing that child’s data and delete it as described under “How long we keep information”. Withdrawal does not make earlier processing unlawful.',
    ],
  },
  {
    heading: 'Who we share information with',
    body: [
      'We share personal data only with service providers (“Data Processors”) that help us run OmniLearn Labs, and only as much as they need. They must protect it and use it only on our instructions:',
      '• Supabase — hosted database and sign-in (stores accounts, child profiles, progress, classes and subscriptions).',
      '• Razorpay — payments and subscriptions.',
      '• Resend — sending emails such as weekly summaries and service messages.',
      '• [HOSTING PROVIDER] — hosting the website and app.',
      '• [SMS / OTP PROVIDER, if different from Supabase] — sending sign-in codes to mobile numbers.',
      'We may also disclose information if required by Indian law, a court order or a lawful request from a government authority, or to protect the safety of a child.',
      'If our business is sold or merged, personal data may pass to the new owner, who must keep protecting it under this policy. We will tell you before that happens.',
    ],
  },
  {
    heading: 'Where data is stored',
    body: [
      'Account and progress data is stored with Supabase in [SUPABASE REGION]. Some of our service providers may process data outside India (for example, Resend for emails). Where this happens, we will only transfer data to countries that are not restricted by the Government of India under the DPDP Act.',
    ],
  },
  {
    heading: 'How long we keep information',
    body: [
      'Free plan: progress is kept only on your device until you clear it. We hold nothing.',
      'Child profile deleted, or consent withdrawn: we delete the child’s name, avatar, progress and observations from our live systems within 30 days.',
      'Account deleted: we delete your account and all your children’s data from our live systems within 30 days.',
      'Backups: deleted data may remain in encrypted backups for up to [BACKUP RETENTION PERIOD] before it is overwritten. Backups are not used for any other purpose.',
      'Inactive accounts: if a paid plan ends and the account is not used for [INACTIVITY PERIOD, e.g. 12 months], we will email you and then delete the synced data if you do not respond.',
      'Classes: when a teacher removes a child or deletes a class, that data is deleted within 30 days. Schools can ask us to delete all their data when their plan ends.',
      'What we keep longer: payment and invoice records, and the record that consent was given or withdrawn, for as long as Indian law (for example tax and GST law) requires. These records do not include your child’s progress.',
    ],
  },
  {
    heading: 'How we protect information',
    body: [
      'We use encrypted connections (HTTPS), row-level access rules in our database so each parent or teacher can reach only their own data, hashed picture passwords, short-lived classroom sessions and limits on repeated sign-in attempts.',
      'No system is perfectly secure. If a personal data breach happens, we will inform affected users and the Data Protection Board of India as the DPDP Act requires.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'As a Data Principal (and as the parent of a child Data Principal), you have the right to:',
      '• Access — ask for a summary of the personal data we hold about you or your child, how we use it, and who we have shared it with. Much of this is visible in the app’s reports.',
      '• Correction — fix inaccurate data, such as a misspelt name. You can edit names and avatars in the app.',
      '• Completion and updating — complete or update incomplete data.',
      '• Erasure — delete a child profile or your whole account in the app (Settings → Delete child / Delete account), or ask us to do it.',
      '• Withdraw consent — at any time, as explained above.',
      '• Grievance redressal — complain to our Grievance Officer and get a response.',
      '• Nomination — name someone to exercise your rights if you die or become unable to act (see below).',
      'To use a right we cannot handle in the app, write to the Grievance Officer. We may need to confirm your identity first. For class data, please contact the school first.',
    ],
  },
  {
    heading: 'Nominating someone',
    body: [
      'You can nominate another person to exercise your rights over your data, and your child’s data, if you die or become unable to act. Write to the Grievance Officer with the nominee’s name and contact details. [IN-APP NOMINATION OPTION — to be added if available.]',
    ],
  },
  {
    heading: 'Grievance Officer',
    body: [
      'If you have a question or complaint about how we handle personal data, contact our Grievance Officer: [GRIEVANCE OFFICER NAME, EMAIL], [LEGAL ENTITY NAME], [ADDRESS].',
      'We will acknowledge your complaint and aim to resolve it within [GRIEVANCE RESPONSE PERIOD].',
      'If you are not satisfied with our response, you may complain to the Data Protection Board of India.',
    ],
  },
  {
    heading: 'Changes to this policy',
    body: [
      'We may update this policy. The version you agreed to is shown at the bottom of this page. If a change affects how we use your child’s data, we will tell you in the app or by email before it takes effect and, where the law requires, ask for your consent again.',
    ],
  },
];

export const TERMS_OF_SERVICE: LegalSection[] = [
  {
    heading: 'Draft — needs legal review',
    body: [
      'These terms are a draft. They have not yet been reviewed by a lawyer and must be reviewed by a qualified Indian lawyer before OmniLearn Labs is launched to the public.',
      'Text in [SQUARE BRACKETS] is a placeholder that still has to be filled in.',
    ],
  },
  {
    heading: 'About these terms',
    body: [
      'These terms are an agreement between you and [LEGAL ENTITY NAME], [ADDRESS] (“we”, “us”), which runs OmniLearn Labs.',
      'By using OmniLearn Labs, or by creating an account, you agree to these terms and to our Privacy Policy. If you do not agree, please do not use the app.',
    ],
  },
  {
    heading: 'Who can use OmniLearn Labs',
    body: [
      'OmniLearn Labs is made for young children, but accounts are for adults only. To create an account, buy a plan or create a class, you must be at least 18 years old and able to enter into a contract under Indian law.',
      'Children may use the app only with the permission and supervision of a parent, guardian or teacher.',
      'If you sign up for a school, you confirm that you are authorised to act for that school.',
    ],
  },
  {
    heading: 'Your account',
    body: [
      'Keep your sign-in details private. You are responsible for what happens in your account.',
      'Add only your own children (or children you are the lawful guardian of) as child profiles, and give consent for them as described in the Privacy Policy.',
      'Tell us straight away if you think someone else has used your account.',
    ],
  },
  {
    heading: 'Free plan',
    body: [
      'The Free plan is free to use and does not need an account. Progress is saved only on your device. We may change what the Free plan includes, but we will not take away chapters that are part of the Free plan without notice.',
    ],
  },
  {
    heading: 'Paid plans and prices',
    body: [
      'Paid plans (Family, Family Plus, Classroom and School) add features such as syncing across devices, more child profiles, reports, extra practice packs and teacher tools. What each plan includes is shown on the plans page when you buy.',
      'All prices are in Indian rupees and include GST at 18%.',
      'School plans are priced per student per year and may be agreed in a separate order form. If the order form differs from these terms, the order form applies for that school.',
    ],
  },
  {
    heading: 'Automatic renewal',
    body: [
      'Monthly and yearly plans renew automatically at the end of each period until you cancel. Renewals are charged through Razorpay, using the payment method you approved, such as a card mandate or UPI AutoPay.',
      'Your bank or UPI app should notify you before each renewal charge, as required by Reserve Bank of India rules. You can also manage or cancel the mandate from your UPI app or bank.',
      'If a renewal payment fails, we may retry it. If it still fails, your account moves to the Free plan features; your synced data is kept for the period stated in the Privacy Policy.',
    ],
  },
  {
    heading: 'Cancelling',
    body: [
      'You can cancel at any time from the app’s account settings. Cancelling stops future renewals. You keep your paid features until the end of the period you have already paid for.',
      'Cancelling a plan does not delete your data. To delete your data, use “Delete account” in the app.',
    ],
  },
  {
    heading: 'Refunds',
    body: [
      '[REFUND POLICY]',
      'Nothing in these terms limits any right to a refund you have under the Consumer Protection Act, 2019 or other Indian law.',
    ],
  },
  {
    heading: 'GST invoices',
    body: [
      'We issue a GST invoice for every payment. Invoices are sent by email or are available in the app. If you need your GSTIN on the invoice (for example, for a school), add it before you pay; we may not be able to change an invoice after it is issued.',
    ],
  },
  {
    heading: 'Changes to plans and prices',
    body: [
      'We may change prices or plan features. We will tell you at least [PRICE CHANGE NOTICE PERIOD, e.g. 30 days] before a price change affects you. The new price applies from your next renewal, and you can cancel before then if you do not agree.',
    ],
  },
  {
    heading: 'Teachers and schools',
    body: [
      'Teachers and schools who create classes must obtain verifiable consent from each child’s parent or guardian before adding the child, and must confirm this to us. They must enter only a first name or nickname and an avatar for each child.',
      'Teachers must keep class codes and picture passwords within the class, share a child’s progress only with that child’s parents and authorised school staff, and remove a child when consent is withdrawn or the child leaves.',
      'Schools on a School plan also agree to our data processing agreement, which sets out how we handle pupils’ data on the school’s behalf.',
    ],
  },
  {
    heading: 'About our learning content',
    body: [
      'OmniLearn Labs content is designed to support Class 1 learning in line with the CBSE and ICSE syllabi. It is an independent learning aid.',
      'OmniLearn Labs is not affiliated with, endorsed by, or approved by NCERT, CBSE or CISCE. Board and textbook names are used only to describe which syllabus the content follows.',
      'We work hard to keep content accurate, but it may contain mistakes, and syllabi change. Please follow your child’s school and teacher where they differ. Tell us about any mistake and we will fix it.',
      'Progress reports are a guide for parents and teachers. They are not formal assessments or certificates.',
    ],
  },
  {
    heading: 'Acceptable use',
    body: [
      'Please use OmniLearn Labs only for learning and teaching. You must not:',
      '• add a child without the consent of their parent or guardian;',
      '• enter more personal information about a child than the app asks for, or write anything in observations that is hurtful, unrelated to learning, or sensitive (such as health, caste or religion);',
      '• share class codes, picture passwords or reports with people who should not have them;',
      '• try to get into accounts, classes or data that are not yours, or test, probe or break our security;',
      '• copy, scrape, resell or republish our content, or use it to build a competing product, except for printing worksheets for your own children or class;',
      '• use bots or automated tools to access the app, or overload it;',
      '• break any Indian law while using the app.',
      'We may suspend or close an account that breaks these rules, especially where a child’s safety or privacy is at risk.',
    ],
  },
  {
    heading: 'Our content',
    body: [
      'The app, its lessons, games, illustrations, audio and worksheets belong to us or our licensors. With a valid plan, you may use them for your own family’s or your own class’s learning. You may print worksheets for that purpose.',
    ],
  },
  {
    heading: 'Changes and availability',
    body: [
      'We are always improving OmniLearn Labs and may add, change or remove features. We try to keep the app available, but we cannot promise it will always work without interruption, especially when offline or on older devices.',
      'If we stop offering a paid plan, we will give you notice and [REFUND POLICY / PRO-RATA TREATMENT FOR DISCONTINUED PLANS].',
    ],
  },
  {
    heading: 'Our responsibility to you',
    body: [
      'We provide OmniLearn Labs with reasonable care and skill. To the extent the law allows, we are not responsible for losses that were not reasonably foreseeable, or for progress lost because browser data was cleared on the Free plan.',
      'To the extent the law allows, our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim. [LIABILITY CAP — to be confirmed by counsel.]',
      'Nothing in these terms limits any rights you have as a consumer under Indian law that cannot be limited by contract.',
    ],
  },
  {
    heading: 'Closing your account',
    body: [
      'You can delete your account at any time in the app. This deletes your data as described in the Privacy Policy and cancels future renewals.',
      'We may suspend or close an account if these terms are seriously broken, if required by law, or to protect children. Where it is safe and lawful, we will tell you why.',
    ],
  },
  {
    heading: 'Governing law and disputes',
    body: [
      'These terms are governed by the laws of India.',
      'Please contact us first so we can try to sort out any problem. If we cannot resolve it, the courts at [JURISDICTION CITY] will have jurisdiction, without affecting any right you have to approach a consumer commission under the Consumer Protection Act, 2019.',
    ],
  },
  {
    heading: 'Changes to these terms',
    body: [
      'We may update these terms. If a change is important, we will tell you in the app or by email before it takes effect. If you keep using OmniLearn Labs after the change, the new terms apply. If you do not agree, you can cancel and delete your account.',
    ],
  },
  {
    heading: 'Contact and grievances',
    body: [
      'Questions or complaints: [GRIEVANCE OFFICER NAME, EMAIL], [LEGAL ENTITY NAME], [ADDRESS].',
    ],
  },
];

/** Statements a parent ticks before a child profile is created or synced. */
export const PARENTAL_CONSENT_TEXT: string[] = [
  'I am 18 or older, and I am this child’s parent or lawful guardian.',
  'I agree that OmniLearn Labs can save my child’s first name, avatar and learning progress (lessons, stars, quiz and practice answers) so the app works and I can see reports.',
  'I understand this information is stored securely online (with Supabase) so it can sync across my devices.',
  'I understand OmniLearn Labs shows no ads, does not track my child on other apps or websites, and never sells my child’s data.',
  'I know I can see, correct or delete my child’s data at any time in the app, and withdraw this consent by deleting the child’s profile.',
  'I have read the Privacy Policy.',
];

/** Statements a teacher or school confirms before creating a class. */
export const SCHOOL_CONSENT_TEXT: string[] = [
  'I am a teacher or authorised staff member, and I am creating this class for teaching at my school.',
  'My school has told parents how OmniLearn Labs uses their child’s data and has obtained verifiable consent from a parent or guardian of every child I add.',
  'I will enter only a first name or nickname and an avatar for each child — no surnames, photos, phone numbers or other details.',
  'I will keep the class code and picture passwords within the class, and share a child’s progress only with that child’s parents and authorised school staff.',
  'I will remove a child from the class if their parent withdraws consent or the child leaves, and I will keep observations about learning only.',
  'I have read the Privacy Policy and Terms of Service.',
];

export const MIC_NOTICE =
  'The microphone uses your browser’s speech recognition to check the word — OmniLearn Labs never records or keeps the audio, but some browsers (such as Chrome) send it to their maker (such as Google) to turn speech into text.';
