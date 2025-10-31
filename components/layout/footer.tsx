import React from "react";
import Image from "next/image";

const quickLinks = [
  { value: "Terms & Conditions", href: "#!" },
  { value: "Privacy Policy", href: "#!" },
  { value: "Refund Policy", href: "#!" },
];

const socialMedia = [
  { value: "Facebook", href: "#!" },
  { value: "Twitter", href: "#!" },
  { value: "Instagram", href: "#!" },
  { value: "LinkedIn", href: "#!" },
];

const Footer = () => (
  <footer className="w-full bg-[#f4fafe] dark:bg-[#2D3748] py-16 px-4 sm:px-6 lg:px-12 xl:px-24">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
      {/* Company Info & Socials */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3">
          {/* Brand mark + name */}
          <Image
            src="/logo.png"
            alt="PrimeAddis"
            width={180}
            height={40}
            className="h-9 w-auto block dark:hidden"
            priority
          />
          <Image
            src="/prime addis white 1.png"
            alt="PrimeAddis"
            width={180}
            height={40}
            className="h-9 w-auto hidden dark:block"
            priority
          />
        </div>
        <p className="mt-4 text-[#03063b]/80 dark:text-gray-300 leading-relaxed max-w-sm">
          Your trusted partner in finding the perfect home. We simplify the
          journey to your new front door.
        </p>
        <div className="flex space-x-4 mt-6">
          {/* Socials */}
          {socialMedia.map((s) => (
            <a
              key={s.value}
              href={s.href}
              aria-label={s.value}
              className="text-[#03063b]/70 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
            >
              {s.value === "Facebook" && (
                <svg
                  aria-hidden="true"
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {s.value === "Twitter" && (
                <svg
                  aria-hidden="true"
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              )}
              {s.value === "Instagram" && (
                <svg
                  aria-hidden="true"
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.163 1.943h-.004c-1.442 0-1.752.006-2.433.036-1.144.052-1.605.248-1.922.563a3.36 3.36 0 00-1.28 1.28c-.315.317-.51.778-.563 1.922-.03 1.08-.036 1.401-.036 2.433s.006 1.353.036 2.433c.053 1.144.248 1.605.563 1.922a3.36 3.36 0 001.28 1.28c.317.315.778.51 1.922.563.68.03 1.04.036 2.433.036h.004c1.442 0 1.752-.006 2.433-.036 1.144-.053 1.605-.248 1.922-.563a3.36 3.36 0 001.28-1.28c.315-.317.51-.778.563-1.922.03-1.08.036-1.401.036-2.433s-.006-1.353-.036-2.433c-.053-1.144-.248-1.605-.563-1.922a3.36 3.36 0 00-1.28-1.28c-.317-.315-.778-.51-1.922-.563-.68-.03-1.04-.036-2.433-.036zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 1.943a3.192 3.192 0 110 6.384 3.192 3.192 0 010-6.384zm3.904-3.963a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
                  />
                </svg>
              )}
              {s.value === "LinkedIn" && (
                <svg
                  aria-hidden="true"
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.297 5.703a.75.75 0 0 0-1.06-1.06L16 9.383V7.5a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 .75.75h3.75a.75.75 0 0 0 0-1.5h-1.883l2.03-2.03zM7 17a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 7 17zM7 14a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 7 14z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Navigation Columns */}
      <div>
        <h3 className="text-lg font-semibold text-[#03063b] dark:text-white">
          Explore
        </h3>
        <ul className="mt-4 space-y-3">
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              For Sale
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              For Rent
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              New Developments
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              Agents
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#03063b] dark:text-white">
          Resources
        </h3>
        <ul className="mt-4 space-y-3">
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              Mortgage Calculator
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              Neighborhood Guides
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              Blog
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#03063b] dark:text-white">
          Company
        </h3>
        <ul className="mt-4 space-y-3">
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              About Us
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              Careers
            </a>
          </li>
          <li>
            <a
              className="text-[#03063b]/80 dark:text-gray-300 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href="#"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="mt-16 border-t border-[#03063b]/10 dark:border-gray-600 pt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">
        <div className="text-sm text-[#03063b]/60 dark:text-gray-400 text-center md:text-left">
          © 2024 RealEstateHub. All Rights Reserved.
        </div>
        <div className="flex items-center gap-6 text-sm">
          {quickLinks.map((item) => (
            <a
              key={item.value}
              className="text-[#03063b]/60 dark:text-gray-400 hover:text-[#0b8bff] dark:hover:text-white transition-colors"
              href={item.href}
            >
              {item.value}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
