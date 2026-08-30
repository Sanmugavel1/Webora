export interface PricingPackage {
  name: string;
  badge?: string;
  tagline: string;
  originalPrice: string;
  price: string;
  features: string[];
  footnote: string;
  ctaLabel: string;
  featured?: boolean;
}

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    name: "Starter Website",
    tagline: "For businesses getting online.",
    originalPrice: "",
    price: "₹5,999",
    features: [
      "Up to 5 pages",
      "Premium responsive design",
      "1-year domain included",
      "1-year hosting included",
      "WhatsApp integration",
      "Call button",
      "Customer enquiry form",
      "Social media integration",
      "3 months technical support",
    ],
    footnote: "Annual hosting renewal ₹4,000.",
    ctaLabel: "GET STARTED",
  },
  {
    name: "Growth Website",
    badge: "MOST POPULAR",
    tagline: "For businesses ready to build a stronger digital presence.",
    originalPrice: "",
    price: "₹9,999",
    features: [
      "Up to 12 pages",
      "Everything in Starter",
      "Premium custom UI/UX",
      "Admin / content management",
      "Google Maps integration",
      "Advanced enquiry forms",
      "Payment gateway integration",
      "6 months technical support",
    ],
    footnote: "Annual hosting renewal ₹4,000.",
    ctaLabel: "GROW YOUR BUSINESS",
    featured: true,
  },
  {
    name: "E-Commerce Website",
    tagline: "For businesses ready to sell online.",
    originalPrice: "",
    price: "Custom Quote",
    features: [
      "Everything in Growth",
      "Product catalogue",
      "Product management",
      "Shopping cart",
      "Checkout system",
      "Payment gateway integration",
      "Order management",
      "Shipping configuration",
      "Customer order flow",
      "6 months technical support",
    ],
    footnote: "Annual hosting renewal ₹4,000.",
    ctaLabel: "BUILD MY STORE",
  },
];

/** Applies when a client already owns a domain and doesn't need a new one. */
export const NO_DOMAIN_DISCOUNT = "₹1,200";
