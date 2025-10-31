import Link from "next/link";

export const metadata = {
  title: "About Us - PrimeAddis",
};

export default function AboutPage() {
  return (
    <main className="flex flex-col gap-12 sm:gap-16 md:gap-20">
      {/* Hero */}
      <section className="mt-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-0 sm:p-4">
            <div
              className="flex min-h-[420px] sm:min-h-[480px] flex-col items-center justify-center gap-6 sm:gap-8 rounded-none sm:rounded-lg bg-cover bg-center bg-no-repeat px-4 text-center"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(3,6,59,0.35) 0%, rgba(3,6,59,0.65) 100%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuCFWcQT1AJhHT7qziz3Vr3Wl8-Q5uODXQcva-kUnqKoT7vLDzghcyeg78T4TU-lQ1PwYweuu543QAlKmZgI3GWitmD7_e2MzvRPPv5cq-xFLgJdG6YkQvMHF4PnTq3CsN2Nft_U2PwmElV69IadMt6xqeivuXZ7TCRNAvDh1Q3ockJlf_pnrM1cEkFNn7y5w8yC73WjKP0kD_69_BifkHCBbiHVq9NdV5Hs-1n25r2Ms42EYoxoeRjUpZHQzQZLCRwncFU5lw2vn8X7)",
              }}
            >
              <div className="max-w-3xl">
                <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight">
                  Welcome to PrimeAddis
                </h1>
                <p className="text-white/95 mt-2 text-base sm:text-lg">
                  Revolutionizing the real estate experience in Addis Ababa with
                  trust, transparency, and technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Purpose */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-foreground text-3xl font-bold tracking-tight">
              Our Purpose
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              {
                icon: "rocket_launch",
                title: "Our Mission",
                desc: "To empower our clients with the data and expertise needed to make intelligent real estate decisions in Addis Ababa.",
              },
              {
                icon: "visibility",
                title: "Our Vision",
                desc: "To be the most trusted and transparent real estate platform in the region, setting new standards for the industry.",
              },
              {
                icon: "favorite",
                title: "Our Values",
                desc: "Integrity, Client-Focus, and Innovation. These principles guide every action we take and every property we list.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-1 flex-col items-center gap-3 rounded-lg border border-primary/20 bg-card dark:bg-gray-900/30 p-6 text-center shadow-sm"
              >
                <div className="text-primary mb-2">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 36 }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-lg font-bold leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-foreground text-3xl font-bold tracking-tight">
              Our Story
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-2" />
          </div>
          <div className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <img
              className="rounded-lg object-cover w-full h-full aspect-[4/3]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbuw0Ja5FCrb-sTyX0en40iE3H9STATHZ4VNKCFDC7DLvPPs7MstCPP8stspBPvM9YM6ldeBBBY0Fq3gXlufgP23j5ipXIQCQh0JyXoQuu-92f_HF2hbm2IVCRIYp7eTCqNuq-bpiUPIeLfty8sgft7cIPCpyeSt2lu0TZCAFmqr0pbUamlA4vrWciywZkcEimsATnv8XiXVWu7CDDmttdiJEZBmMF24h-PhmaIqaKMMCljvour0lyfNKdndAzYrQfSyvNrezV53LA"
              alt="Two founders shaking hands in a modern office"
            />
            <div className="flex flex-col gap-4">
              <h3 className="text-foreground text-xl font-bold">
                From a Shared Vision to a Trusted Platform
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                PrimeAddis was founded in 2022 by a group of passionate real
                estate professionals and tech innovators who saw a gap in the
                Addis Ababa property market. Frustrated by the lack of
                transparency and reliable information, we set out to create a
                platform that puts the client first. Our journey began with a
                simple goal: to make buying, selling, and renting properties as
                seamless and trustworthy as possible. By combining deep local
                market knowledge with cutting-edge technology, we've grown into
                a leading name in the industry, dedicated to serving our
                community with integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-foreground text-3xl font-bold tracking-tight">
              Meet the Team
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mt-2" />
            <p className="text-muted-foreground text-sm mt-4 max-w-2xl mx-auto">
              The dedicated professionals working to bring you the best real
              estate experience in Addis Ababa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[
              {
                name: "Addis",
                role: "Co-Founder & CEO",
                blurb:
                  "Addis vision and leadership are the driving forces behind PrimeAddis's success.",
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRBr_uQQgZtIG2K1z16IcRgbkRg7YX-egLkFJmCIa78ATVApjLDQiUGEoexxzvb4PK3iJEXJ9CBZsqwcpSXsScsTLX_tbVRhwNAdiSbLnJDN7lQhioZVmxftXFPbT3di_GSyC-Uj8GhhSOUaYE8rlO-rGjq2Nf4eKo75dR4T9kUqU6uvonF9to2CsQawRB0rK-k-f8xdLmRFx_qaUknNOlZKMaDJStSkJbxZMR20Nu4G8XkN1_rvFE_2V3VxkwVIVzjRanKdngHzdt",
              },
              {
                name: "Haile",
                role: "Head of Sales",
                blurb:
                  "Haile ensures our clients find their perfect properties with a smile.",
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2_JqpTxBMNWfAGCwj0qm65q6WGWuH0NzKEQ-tzE46mxPHKY2iYHEFliX6A3LWo1eplaqFhCMablZxLI8pWsqXZW5iFvuNZITpHywmMYOj2GBeTR6TXiKxiq8f_rHJ6P2EwPPY3mNrkm1cudD2GKjCL7mNctpqYjdEal1li1LqU6Slu0GEFZvikpcIFy13p9Y2RJGvoBg2xgVwQEf_8T2-8cgtgS_7p9GfRdc3ikkZ-xDCskgBmgQ_Zlu-GM96iBwTubrjoORHmT49",
              },
              {
                name: "Abel",
                role: "Lead Developer",
                blurb:
                  "Abel is the technical wizard who keeps our platform running smoothly.",
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9DcIKn-v7uJ3gGMayBBSYZvPXLL-RgOFFFI7jskzUSIj7llgHH_AqrEmRlLp0OS102YSFX3x1PGqEk7qU7NIA_9Oo0uCbe6665g6EMgF406hgSO9DHykMpcJyW-0HrL-Y6-9oqoHTJ7Kpx337EideF0ZBx6m6Bo0A2O3uxXysDItjmL9cqhuq5U74P17wRGQD5SAbtbVYsVAMMxrh3mKS88RO0RBf3zORaedLDYvW5aFCBI1MRfa35pA-hC9xJmj_flzSwUZ4uI1T",
              },
              {
                name: "Henok",
                role: "Marketing Director",
                blurb: "Henok shares the PrimeAddis story with the world.",
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKMTN9CcHFjs5owlW2wrPoZ7kQLYCJ5darRUSODx9CngKdzSB9O3ZecONymMIfdAZMuiAhaj4Ln25SVjL5eul2BRfqsLoBYfeE1h8TjIyfUclglm_lGbJ6x0zeoIKCz61xZFF75MlmnRbuOnLiErjyL5zg2WwEtIrZVvJZbjmq3PYZxDTTPpRKPVYTGgug18yXFuHsm7-BzVAN-h24hrEg6RxgiHWz32qq_tg0Xu0fCgtCY8WsQBhx89x_BUBryT3wLVsXoXq0VD78",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card dark:bg-gray-900/30 border border-primary/20 shadow-sm"
              >
                <img
                  className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-primary"
                  src={m.src}
                  alt={`Headshot of ${m.name}`}
                />
                <h4 className="text-foreground font-bold">{m.name}</h4>
                <p className="text-primary text-sm font-medium">{m.role}</p>
                <p className="text-muted-foreground text-xs mt-2">{m.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-card dark:bg-gray-900/30 p-10 my-2 sm:my-6 md:my-10 rounded-lg shadow-sm border border-primary/20">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-muted-foreground text-sm mt-2 mb-6 max-w-lg mx-auto">
              Let us help you navigate the Addis Ababa real estate market.
              Explore our curated listings or get in touch with our expert
              agents today.
            </p>
            <Link
              href="/properties"
              className="inline-flex min-w-[84px] items-center justify-center rounded-lg h-12 px-5 bg-primary text-primary-foreground text-base font-bold tracking-wide hover:bg-primary/90"
            >
              Explore Our Properties
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
