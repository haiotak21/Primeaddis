import React from "react";

const quickLinks = [
  { value: "Terms & Conditions", href: "#!" },
  { value: "Privacy Policy", href: "#!" },
  { value: "Refund Policy", href: "#!" },
];

const socialMedia = [
  { value: "Facebook", href: "#!" },
  { value: "Instagram", href: "#!" },
  { value: "LinkedIn", href: "#!" },
  { value: "Twitter", href: "#!" },
];

const Footer = () => (
  <footer className="ezy__footer8_TxQPxvpv relative bg-background text-foreground pt-16 pb-8">
    <svg
      className="absolute top-0 left-0 w-full h-12"
      viewBox="0 0 1920 45"
      preserveAspectRatio="none"
    >
      <path
        d="M 959 45 C 1279.067 45 1599.4 45.667 1920 0 L 0 0 C 319.267 45.667 638.933 45 959 45 z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:justify-between gap-8">
        <div className="flex-1 mt-4 md:mt-0">
          <img
            width="180"
            height="40"
            alt="PrimeAddis Logo"
            src="/logo.png"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex-[2] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="opacity-25 font-normal uppercase text-sm mb-2">
              Quick Links
            </p>
            <ul className="flex flex-col">
              {quickLinks.map((qLink, i) => (
                <li key={i} className="mb-2">
                  <a
                    href={qLink.href}
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    {qLink.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="opacity-25 font-normal uppercase text-sm mb-2">
              Social Media
            </h6>
            <ul className="flex flex-col">
              {socialMedia.map((media, i) => (
                <li key={i} className="mb-2">
                  <a
                    href={media.href}
                    className="opacity-70 hover:opacity-100 transition"
                  >
                    {media.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h6 className="opacity-25 font-normal uppercase text-sm mb-2">
              Language
            </h6>
            <select className="form-select px-4 w-full mb-4">
              <option value="en">English</option>
              <option value="bn">Bangla</option>
            </select>
            <h6 className="opacity-25 font-normal uppercase text-sm mb-2">
              Currency
            </h6>
            <select className="form-select px-4 w-full">
              <option value="en">US Dollars $</option>
              <option value="bn">UK Dollars $</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-8 opacity-50 text-center md:text-left">
        <span>Copyright &copy; Easy Frontend, All rights reserved</span>
        {quickLinks.map((item, i) => (
          <a key={i} className="ml-4" href={item.href}>
            {item.value}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
