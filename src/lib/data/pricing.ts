export interface PricingPackage {
  name: string;
  badge?: string;
  tagline: string;
  originalPrice: string;
  price: string;
  gstNote: string;
  features: string[];
  footnote: string;
  featured?: boolean;
}

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    name: "Standard Package",
    tagline: "For businesses getting online.",
    originalPrice: "₹10,000",
    price: "₹7,999",
    gstNote: "+ 18% GST (₹1,440)",
    features: [
      "5 pages website",
      "1 year free domain name (.com / .in / .org)",
      "1 year free cloud hosting",
      "Dynamic website (premium design)",
      "Admin access",
      "Lifetime 24/7 free hosting support",
      "Unlimited images & videos upload",
      "Free SSL certificate",
      "5 free email IDs",
      "SEO-friendly website",
      "100% responsive website",
      "Live chat integration",
      "Payment gateway integration",
      "Social media integration",
      "Call button integration",
      "WhatsApp button integration",
      "Inquiry form",
      "1 year free technical support",
    ],
    footnote: "Annual hosting renewal ₹4,000.",
  },
  {
    name: "Premium Package",
    badge: "MOST POPULAR",
    tagline: "For businesses ready to build a stronger digital presence.",
    originalPrice: "₹20,000",
    price: "₹13,999",
    gstNote: "+ 18% GST (₹2,520)",
    features: [
      "12 pages website",
      "1 year free domain name (.com / .in / .org)",
      "1 year free cloud hosting",
      "Dynamic website (premium design)",
      "Admin access",
      "Google Search Console setup",
      "Lifetime 24/7 free hosting support",
      "Unlimited images & videos upload",
      "Free SSL certificate",
      "10 free email IDs",
      "SEO-friendly website",
      "100% responsive website",
      "Live chat integration",
      "Payment gateway integration",
      "Social media integration",
      "Call button integration",
      "WhatsApp button integration",
      "Inquiry form",
      "WooCommerce features",
      "1 year free technical support",
    ],
    footnote: "Annual hosting renewal ₹4,000.",
    featured: true,
  },
  {
    name: "Pro Package",
    badge: "CUSTOM PLAN",
    tagline: "For businesses ready to sell online, built to spec.",
    originalPrice: "",
    price: "Get a Quote",
    gstNote: "+ 18% GST applicable",
    features: [
      "Pages: according to requirement",
      "1 year free domain name (.com / .in / .org)",
      "1 year free cloud hosting",
      "Dynamic website",
      "Admin access",
      "Google Search Console setup",
      "Lifetime 24/7 free hosting support",
      "Unlimited images & videos upload",
      "Free SSL certificate",
      "10 free email IDs",
      "SEO-friendly website",
      "100% responsive website",
      "Live chat integration",
      "Payment gateway integration",
      "Social media integration",
      "Call button integration",
      "WhatsApp button integration",
      "Inquiry form",
      "WooCommerce features",
      "1 year 24/7 free technical support",
    ],
    footnote: "Annual hosting renewal ₹4,000.",
  },
];

/** Applies when a client already owns a domain and doesn't need a new one. */
export const NO_DOMAIN_DISCOUNT = "₹1,200";
