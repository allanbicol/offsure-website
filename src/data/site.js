// All site content lives here so copy can be edited without touching layout.
// Sourced from the existing offsure.com pages.

// Internal links go through url() so the site also works when served from a sub-path
// (for example a GitHub Pages project site).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (path) => base + path;

export const nav = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Talent', href: '/talent' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
];

export const booking = {
  australia: 'https://outlook.office365.com/owa/calendar/OffshoringDiscoverycall@offsure.com/bookings/',
  usa: 'https://outlook.office365.com/owa/calendar/OffsureDiscoverycallUSA@offsure.com/bookings/',
};

export const contact = {
  email: 'info@offsure.com',
  phones: [
    { place: 'USA', number: '+1-888-308-2019', tel: '+18883082019' },
    { place: 'Australia', number: '+61-7-3166-8385', tel: '+61731668385' },
    { place: 'Philippines', number: '+63-45-457-1064', tel: '+63454571064' },
  ],
  offices: [
    {
      place: 'Philippines',
      lines: ['2nd Floor Room 1-A, Philexcel Business Center 10', 'M.A. Roxas Highway, Clark Freeport Zone', 'Pampanga, Philippines 2023'],
    },
    {
      place: 'Hong Kong',
      lines: ['Unit 12, Floor 9, Kenning Building', '19 Wang Hoi Road', 'Kowloon Bay, Hong Kong'],
    },
  ],
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/offsuretogether/' },
    { label: 'Facebook', href: 'https://www.facebook.com/OffsureLtd' },
    { label: 'Instagram', href: 'https://www.instagram.com/offsuretogether/' },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCaYmLmN6JMnsdEbf-3_P8vQ' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@offsuretogether' },
    { label: 'Twitter', href: 'https://twitter.com/OFFSUREtogether' },
  ],
};

export const links = {
  jobBoard: 'https://clientapps.jobadder.com/10837/offsure',
  resume: 'https://apply.jobadder.com/au5/1794/683434/anmkd3wazr3ulllsu6a63pjqka',
  clientStories: 'https://www.youtube.com/playlist?list=PLoR7T2qdyPNML1OYbHWxtOePMCCUwvjPv',
  introVideoId: '2fbuPSAV7UY',
};

// Cities shown on the hero globe and clock strip. Clark is where the team works;
// the others are the markets Offsure serves.
export const cities = [
  { id: 'clark', name: 'Clark', country: 'Philippines', tz: 'Asia/Manila', lat: 15.19, lon: 120.56, home: true },
  { id: 'brisbane', name: 'Brisbane', country: 'Australia', tz: 'Australia/Brisbane', lat: -27.47, lon: 153.03 },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', lat: -36.85, lon: 174.76 },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', tz: 'America/Los_Angeles', lat: 34.05, lon: -118.24 },
  { id: 'new-york', name: 'New York', country: 'United States', tz: 'America/New_York', lat: 40.71, lon: -74.01 },
];

export const steps = [
  {
    title: 'You give us a job description',
    body: 'Tell us the qualifications, responsibilities and requirements for the role. We shape a tailored team around your specific business needs.',
    advantage: 'Personalized approach',
    advantageBody: 'A team tailored to your specific business needs, so the solutions you get are customized and of the highest quality.',
  },
  {
    title: 'We recruit talented professionals',
    body: 'A meticulous screening process brings you skilled, experienced people with a diverse set of skills.',
    advantage: 'Exceptional talent',
    advantageBody: 'Our meticulous screening process means you work with highly skilled and experienced professionals.',
  },
  {
    title: 'Your dedicated staff report to you daily',
    body: 'They are part of your team. You get regular updates on their progress, and your operations keep running smoothly.',
    advantage: 'Diverse range of expertise',
    advantageBody: 'Software design and development, accounting and finance, administration, cybersecurity, marketing and virtual assistance, all under one roof.',
  },
  {
    title: 'We manage the office operations',
    body: 'We handle the day-to-day administration that keeps the workplace running, so you can focus on your core business.',
    advantage: 'Competitive advantage',
    advantageBody: 'Optimized operations and higher productivity give you a distinct edge in your industry.',
  },
];

export const solutions = [
  {
    id: 'accountant',
    role: 'an accountant',
    title: 'Accounting',
    short: 'Manage your finances with accuracy and efficiency, with professionals you handpick.',
    description:
      'We help you build a team of highly competent professionals who are well versed in the latest accounting practices and regulations. They provide accurate, timely and personalized accounting services tailored to your business, from bookkeeping and tax preparation to financial analysis and reporting.',
    bullets: ['Bookkeeping', 'General accounting', 'Payroll', 'Tax preparation', 'Financial analysis', 'Financial reporting', 'Accounts payable', 'Paraplanning', 'Reconciliation'],
    platforms: ['Xero', 'QuickBooks', 'Dext', 'Fathom', 'simPRO'],
  },
  {
    id: 'propertymanager',
    role: 'a property manager',
    title: 'Property management',
    short: 'We take care of your property management tasks while you take care of homeowners.',
    description:
      'We help you form a team of property management specialists with extensive knowledge of property management practices and the latest industry tools. You get customized property management services tailored to your business, with the focus on excellence and attention to detail that real estate agencies rely on.',
    bullets: ['Tenant screening', 'Lease administration', 'Rent collection', 'Maintenance and repairs', 'Property inspections', 'Budgeting and financial planning', 'Marketing and advertising', 'Vendor management', 'Risk management'],
    platforms: ['Our Property', 'PropertyMe', 'Property Tree', 'REST', 'Ignite', '2Apply', 'DocuSign', 'IRE', 'RealWorks', 'VaultRE'],
  },
  {
    id: 'developer',
    role: 'a developer',
    title: 'Software development',
    short: 'Build software with excellent quality and functionality at the highest level.',
    description:
      'We help you build a skilled team with expertise in software design and development, quality assurance testing and database management. Your developers work exclusively as part of your team. Their experience in cloud computing, artificial intelligence and cybersecurity delivers secure solutions that are scalable and dependable.',
    bullets: ['Software design and development', 'Quality assurance testing', 'Database management', 'Mobile application development', 'Web development', 'Cloud computing', 'Artificial intelligence', 'Cybersecurity', 'Technical documentation'],
    platforms: ['PHP', 'Python', 'Angular', 'React', 'Vue', 'Node', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'AWS', 'Azure', 'Google Cloud'],
  },
  {
    id: 'marketing',
    role: 'a marketing specialist',
    title: 'Marketing',
    short: 'Get the competitive edge you need with an expert marketing team of your own.',
    description:
      'We help you assemble experienced marketers who understand the complexities of the global market and develop strategies that resonate with your audience. Skills range from market research and branding to digital marketing and social media management, so you can concentrate on your core competencies.',
    bullets: ['Brand development', 'Marketing strategy and planning', 'Content creation and management', 'Social media marketing', 'Search engine optimization', 'Pay-per-click advertising', 'Email marketing', 'Analytics and reporting', 'Marketing automation'],
    platforms: ['HubSpot', 'Mailchimp', 'WordPress', 'Google Analytics', 'Canva', 'SendGrid', 'Google Ads', 'Facebook Ads', 'Twitter Ads'],
  },
  {
    id: 'virtualassistant',
    role: 'a virtual assistant',
    title: 'Virtual assistant',
    short: 'Stay on top of your day-to-day tasks with reliable, efficient administrative support.',
    description:
      'We connect you with proficient virtual assistants who handle back-office and administrative tasks, so you can optimize your operations and prioritize core business activities. Every assistant is meticulously screened, whether you need a one-time task done or ongoing support.',
    bullets: ['Email management', 'Scheduling and calendar management', 'Data entry and management', 'Research and analysis', 'Social media management', 'Customer service and support', 'Travel planning and coordination', 'Bookkeeping and invoicing', 'Personal assistance'],
    platforms: ['Google Workspace', 'Microsoft Office', 'Slack', 'Trello', 'Asana', 'Zoom', 'Skype', 'Google Meet'],
  },
  {
    id: 'itsupport',
    role: 'an IT support specialist',
    title: 'IT support',
    short: 'Keep your systems running smoothly with a dedicated team of technical experts.',
    description:
      'Save valuable resources by reducing the need for in-house IT staff and equipment. We help you build a team with extensive experience managing and maintaining hardware, software and network systems. They provide round-the-clock support, resolve issues swiftly, and keep your systems secure and up to date.',
    bullets: ['Network administration', 'Hardware and software installation', 'Technical support', 'Server management', 'Data backup and recovery', 'Virus and malware protection', 'Remote desktop support', 'IT consulting and strategy', 'Cloud services management'],
    platforms: ['Microsoft services', 'Zendesk', 'SolarWinds', 'Cisco Webex', 'Freshdesk'],
  },
];

export const pricing = {
  parts: ['Workforce cost', 'Reasonable fees'],
  assurances: [
    { title: 'No exit charges or penalties', body: 'Leaving costs you nothing extra.' },
    { title: '100% transparency', body: 'You see what you pay for.' },
    { title: 'Flexible payments', body: 'A variety of pricing options to suit your needs.' },
  ],
  options: [
    { id: 'office', title: 'Office based', body: 'Your staff work from the Offsure office in Clark Freeport Zone.' },
    { id: 'home', title: 'Work from home', body: 'Your staff work remotely from home.' },
  ],
};

export const values = [
  { name: 'Play', body: 'A vital component of our journey, as we savor the moments that bring joy and fulfillment. It nourishes our spirits, fosters creativity and restores balance.' },
  { name: 'Focus', body: 'A guiding beacon in our pursuit of excellence. With unwavering attention, we channel our energy, unlock hidden potential and achieve remarkable feats.' },
  { name: 'Embrace', body: 'We assimilate diverse perspectives, ideas and experiences, fostering an environment where collaboration and adaptation thrive.' },
  { name: 'Change', body: 'It fuels growth, fosters innovation and propels us forward on the path of evolution. Embracing its transformative power, we transcend limitations and adapt to new horizons.' },
  { name: 'Passion', body: 'It ignites our souls, fuels our dreams and propels us towards greatness. It is the unwavering flame that drives our purpose and transforms aspirations into reality.' },
];

export const perks = [
  'Unlimited coffee',
  'Free shuttle service',
  'COVID-19 safe workplace',
  'HMO',
  'Government benefits',
  'Work-life balance',
  'Vacation leave',
  'Maternity leave',
  'Incentives and allowances',
  '13th month and bonus pay',
];
