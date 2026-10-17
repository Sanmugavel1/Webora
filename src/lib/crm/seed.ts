/**
 * Starter message formats + follow-up sequences, inserted once when the CRM
 * database is first created. Everything here is editable from /crm afterwards.
 */

type SeedTemplate = { key: string; name: string; channel: "email" | "whatsapp"; subject?: string; body: string };

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    key: "welcome_wa",
    name: "Welcome — instant reply",
    channel: "whatsapp",
    body: `Hi {{first_name}}! 👋 Thanks for reaching out to WEBORA about {{service}}. We'd love to help {{business}} grow online.

Could you share a little about what you have in mind — number of pages, any reference sites you like, and when you'd like to go live?`,
  },
  {
    key: "welcome_email",
    name: "Welcome email",
    channel: "email",
    subject: "Thanks for contacting WEBORA, {{first_name}}",
    body: `Hi {{first_name}},

Thank you for contacting WEBORA about {{service}} — we're glad you reached out.

Here's what happens next:
1. A quick 10-minute call to understand your business and goals
2. We share a design direction and a clear quote
3. Your website goes live — usually within 7–14 days

You can see our packages here: {{pricing_link}}

Just reply to this email or WhatsApp us on {{whatsapp}} whenever suits you.

Regards,
{{agent}}
We Build Websites That Grow Brands
{{website}}`,
  },
  {
    key: "checkin_wa",
    name: "Day 2 — gentle check-in",
    channel: "whatsapp",
    body: `Hi {{first_name}}, just checking in 🙂

Did you get a chance to think about your website for {{business}}? Happy to jump on a quick call whenever you're free — just tell me a time that works.`,
  },
  {
    key: "pricing_email",
    name: "Day 5 — packages & work",
    channel: "email",
    subject: "{{first_name}}, here's what a WEBORA website includes",
    body: `Hi {{first_name}},

In case it helps you decide, here's a quick summary of our packages:

• Starter Website — ₹7,199: up to 5 pages, premium responsive design, 1-year domain + hosting, WhatsApp & call buttons, enquiry form, 3 months support
• Growth Website — ₹10,999: up to 12 pages, custom UI/UX, admin/content management, Google Maps, payment gateway, 6 months support

Full details: {{pricing_link}}

If you tell me a bit more about {{business}}, I'll recommend the right fit — no pressure.

Regards,
{{agent}}`,
  },
  {
    key: "last_wa",
    name: "Day 10 — last nudge",
    channel: "whatsapp",
    body: `Hi {{first_name}}, I don't want to keep messaging if the timing isn't right 🙏

If you'd still like a website for {{business}}, just reply "YES" and I'll set up a quick call. Otherwise, no worries at all — we're here whenever you're ready.

— {{agent}}`,
  },
  {
    key: "proposal_wa",
    name: "Proposal follow-up",
    channel: "whatsapp",
    body: `Hi {{first_name}}, hope you had a chance to look at the proposal we sent for {{business}}.

Any questions or changes you'd like? We can start as soon as you're ready to go ahead.`,
  },
  {
    key: "onboard_wa",
    name: "Won — onboarding",
    channel: "whatsapp",
    body: `Welcome aboard, {{first_name}}! 🎉

To get started on the {{business}} website, please send us:
• Your logo (if you have one)
• Photos of your business / products
• Services and prices you want listed
• Contact details, address and Google Maps link

We'll share the first design soon after.`,
  },
];

type SeedSequence = {
  name: string;
  description: string;
  trigger: string;
  active: boolean;
  steps: { day: number; channel: "email" | "whatsapp"; template: string }[];
};

export const SEED_SEQUENCES: SeedSequence[] = [
  {
    name: "New enquiry nurture",
    description: "Instant welcome, then follow-ups on day 2, 5 and 10 until the lead replies or is closed.",
    trigger: "new_lead",
    active: true,
    steps: [
      { day: 0, channel: "whatsapp", template: "welcome_wa" },
      { day: 0, channel: "email", template: "welcome_email" },
      { day: 2, channel: "whatsapp", template: "checkin_wa" },
      { day: 5, channel: "email", template: "pricing_email" },
      { day: 10, channel: "whatsapp", template: "last_wa" },
    ],
  },
  {
    name: "Proposal follow-up",
    description: "Nudges two and five days after a proposal is sent.",
    trigger: "stage:proposal",
    active: true,
    steps: [
      { day: 2, channel: "whatsapp", template: "proposal_wa" },
      { day: 5, channel: "whatsapp", template: "checkin_wa" },
    ],
  },
  {
    name: "Client onboarding",
    description: "Sends the content checklist as soon as a deal is won.",
    trigger: "stage:won",
    active: true,
    steps: [{ day: 0, channel: "whatsapp", template: "onboard_wa" }],
  },
];
