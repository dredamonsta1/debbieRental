import { useEffect, useRef } from "react";
import { Highlight } from "@/components/Highlight";
import { RequestRentalForm } from "@/components/RequestRentalForm";

export function LandingPage() {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === "#request") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-white text-zinc-900">
      {/* Top bar */}
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="font-bold tracking-tight text-lg sm:text-xl">
            REPUTABLE<span className="text-brand">RIDES</span>
          </div>
          <button
            type="button"
            onClick={scrollToForm}
            className="bg-brand text-black px-3 sm:px-5 h-9 sm:h-10 font-bold text-xs sm:text-sm uppercase tracking-wide hover:brightness-95 transition"
          >
            Request a Rental
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        {/* Yellow trapezoid shape behind the car */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-full sm:w-2/3 bg-brand"
          style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-5 sm:space-y-7">
            <h1 className="text-4xl sm:text-6xl font-black uppercase leading-[0.95] tracking-tight">
              <Highlight>Rentals</Highlight> made
              <br />
              easy.
            </h1>
            <p className="text-base sm:text-lg text-zinc-700 max-w-md">
              The Tri-State area's premier rental service. Standard and luxury vehicles,
              convenient pickup, and straightforward pricing.
            </p>
            <button
              type="button"
              onClick={scrollToForm}
              className="bg-black text-white px-6 h-12 font-bold uppercase tracking-wide text-sm hover:bg-zinc-800 transition"
            >
              Request a Rental
            </button>
          </div>
          <div className="relative h-56 sm:h-80 md:h-96">
            <img
              src="/hero-car.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain object-center"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      {/* Yellow stripe divider */}
      <div className="h-3 bg-brand" />

      {/* About */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="aspect-[4/3] bg-zinc-900 rounded-sm overflow-hidden">
            <img
              src="/about-car.png"
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-3xl sm:text-5xl font-black uppercase leading-tight">
              <Highlight>About</Highlight> us
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              ReputableRides is the Tri-State area's premier vehicle rental service that prides
              itself on two things: <strong className="text-white">convenience</strong> and{" "}
              <strong className="text-white">affordable pricing</strong>.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Our fleet of standard and luxury vehicles is at your disposal for all of your
              transportation needs. Submit a request below and we'll get back to you to confirm
              your pickup.
            </p>
          </div>
        </div>
      </section>

      {/* Yellow stripe divider */}
      <div className="h-3 bg-brand" />

      {/* Request form */}
      <section id="request" ref={formRef} className="bg-white scroll-mt-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl sm:text-5xl font-black uppercase leading-tight">
              Request a <Highlight>Rental</Highlight>
            </h2>
            <p className="text-zinc-500">Fill out the form and we'll confirm shortly.</p>
          </div>
          <RequestRentalForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold tracking-tight">
            REPUTABLE<span className="text-brand">RIDES</span>
          </div>
          <div className="text-xs text-zinc-400">
            © {new Date().getFullYear()} ReputableRides. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
