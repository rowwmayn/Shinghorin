export default function HowToOrder() {
  const steps = [
    {
      num: '01',
      title: 'Browse & pick',
      desc: 'Add ready-made pieces to your basket, or send a custom request.',
    },
    {
      num: '02',
      title: 'Website or WhatsApp',
      desc: 'Order directly on our site in 1 click, or checkout via WhatsApp to chat first.',
    },
    {
      num: '03',
      title: 'We prepare & confirm',
      desc: 'We log your order in our studio, craft your pieces, and confirm Cash on Delivery.',
    },
    {
      num: '04',
      title: 'Delivered & paid',
      desc: 'Your piece arrives — pay the courier in cash on arrival.',
    },
  ];

  return (
    <section className="py-20 md:py-24 px-5 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--marigold-deep)] mb-3">
            Four Steps
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            How Ordering Works
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {steps.map((step) => (
            <div key={step.num} className="step-card flex flex-col justify-between">
              <div>
                <p className="step-num mb-2">{step.num}</p>
                <h3 className="font-display text-xl font-bold mb-1.5 text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="text-sm opacity-75 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
