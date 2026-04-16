export default function CustomerHomeHero() {
  function shopNow() {
    document.getElementById('shop-catalog')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <section className="shop-fade-in border-b border-brand-border bg-gradient-to-br from-brand-surface via-white to-brand-border/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold leading-tight text-brand sm:text-4xl lg:text-5xl">
            Welcome to Smart Green Nursery 🌿
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Premium plants from trusted nurseries — curated for your home and
            garden. Order online and pay cash on delivery.
          </p>
          <button
            type="button"
            onClick={shopNow}
            className="mt-8 inline-flex rounded-shop bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light hover:shadow-shop-hover"
          >
            Shop now
          </button>
        </div>
      </div>
    </section>
  );
}
