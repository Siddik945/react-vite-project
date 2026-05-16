import React, { useState } from 'react';

type StatCardProps = {
  label: string;
  value: string | number;
};

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Layout() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
  });

  const openModal = (modalName: string) => {
    setAuthForm({ email: '', password: '' });
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleContactChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert('Thank you for contacting Monsur Enterprise. We will get back to you soon.');
    setContactForm({ name: '', phone: '', email: '', subject: '', message: '' });
  };

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const url =
      activeModal === 'register' ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (data.data.access_token) {
        localStorage.setItem('access_token', data.data.access_token);
      }

      if (data.data.refresh_token) {
        localStorage.setItem('refresh_token', data.data.refresh_token);
      }

      closeModal();
      setAuthForm({ email: '', password: '' });

      if (activeModal === 'login') {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const menuLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact Us', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xl font-bold text-slate-700 md:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>

            <a href="#home" className="text-2xl font-bold tracking-tight text-emerald-700">
              Monsur Enterprise
            </a>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {menuLinks.map((link) => (
              <a
                key={link.href}
                className="font-medium text-slate-700 hover:text-emerald-700"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openModal('login')}
            className="rounded-full border border-emerald-700 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Login
          </button>
        </nav>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeMenu}
            aria-label="Close menu overlay"
          />

          <aside className="absolute top-0 left-0 h-full w-72 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-emerald-700">Monsur Enterprise</h2>

              <button
                type="button"
                onClick={closeMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700 hover:bg-slate-200"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-5">
              {menuLinks.map((link) => (
                <a
                  key={link.href}
                  onClick={closeMenu}
                  href={link.href}
                  className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </aside>
        </div>
      )}

      <main>
        <section
          id="home"
          className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-emerald-300 blur-3xl" />
            <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-cyan-300 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
            <div>
              <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Welcome to Monsur Enterprise.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50">
                A trusted company with successful project experience across Dhaka, committed to
                quality, reliability, and professional service.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="rounded-full bg-white px-8 py-3 text-center font-bold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
                >
                  Contact Us
                </a>

                <a
                  href="#about"
                  className="rounded-full border border-white/50 px-8 py-3 text-center font-bold text-white transition hover:bg-white/10"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 shadow-2xl ring-1 ring-white/20 backdrop-blur">
              <div className="rounded-2xl bg-white p-8 text-slate-900">
                <h2 className="text-2xl font-bold text-emerald-800">Company Highlights</h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-5">
                    <p className="text-3xl font-extrabold text-emerald-800">40+</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">Completed Projects</p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-5">
                    <p className="text-3xl font-extrabold text-emerald-800">2010</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">Established</p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-5 sm:col-span-2">
                    <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                      Office Location
                    </p>
                    <p className="mt-2 font-bold text-slate-800">
                      Azimpur Super Market, Dakkhinkhan, Dhaka-1230
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-30">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Building trust through successful project delivery.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Monsur Enterprise was established in 2010. The founder of the company is Md. Abul
                Monsur, and the Managing Director is Md. Abu Bakar Siddik.
              </p>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                So far, we have successfully completed more than 40 projects in Dhaka. Our office is
                located at Azimpur Super Market, Dakkhinkhan, Dhaka-1230.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
                  01
                </div>
                <h3 className="mt-5 text-xl font-bold">Founder</h3>
                <p className="mt-2 text-slate-600">Md. Abul Monsur</p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
                  02
                </div>
                <h3 className="mt-5 text-xl font-bold">Managing Director</h3>
                <p className="mt-2 text-slate-600">Md. Abu Bakar Siddik</p>
                <small>B.Sc Engineer</small>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:col-span-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
                  03
                </div>
                <h3 className="mt-5 text-xl font-bold">Project Experience</h3>
                <p className="mt-2 text-slate-600">
                  More than 40 successfully completed projects in Dhaka.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Our Services
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                এখানে সকল প্রকার ইট, ইটের খোয়া, সাদা আস্তর বালি ময়মনসিংহ, সাদা আস্তর বালি ভুয়াপুর,
                সিলেট বালি, সাদা এলসি পাথর, কালো এলসি পাথর, পাকুর পাথর, ভুটান পাথর, রাইটার পাথর,
                ভুতু ভাঙ্গা পাথর, সিংগের পাথর পাওয়া যায়।
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {['Reliable Service', 'Professional Support', 'Future Expansion'].map((service) => (
                <div
                  key={service}
                  className="rounded-3xl bg-slate-50 p-8 text-center shadow-sm ring-1 ring-slate-200"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-2xl font-black text-white">
                    ✓
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">{service}</h3>

                  <p className="mt-3 text-slate-600">
                    Monsur Enterprise is focused on providing dependable and improved services for
                    clients.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Get in touch with Monsur Enterprise.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Send us a message using the contact form or visit our office location in Dhaka.
              </p>

              <div className="mt-8 space-y-4">
                <ContactInfo label="Phone Number" value="01737-593600, 01766-229353" />
                <ContactInfo label="Email" value="absiddik945@gmail.com" />
                <ContactInfo
                  label="Location"
                  value="Azimpur Super Market, Dakkhinkhan, Dhaka-1230"
                />
                <ContactInfo label="Office Hours" value="9:00 AM - 10:00 PM" />
              </div>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200"
            >
              <h3 className="text-2xl font-bold text-slate-900">Contact Form</h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Your name"
                  required
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  placeholder="Your phone number"
                  required
                />

                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="Your email"
                  required
                />

                <InputField
                  label="Subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  placeholder="Message subject"
                  required
                />
              </div>

              <div className="mt-5">
                <label
                  className="mb-2 block text-sm font-semibold text-slate-700"
                  htmlFor="message"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Write your message"
                  rows={5}
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 transition outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-2xl bg-emerald-700 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-200 focus:outline-none"
              >
                Submit
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-xl font-bold">Monsur Enterprise</h2>
            <p className="mt-1 text-sm text-slate-400">Established in 2010 · Dhaka, Bangladesh</p>
          </div>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Monsur Enterprise. All rights reserved.
          </p>
        </div>
      </footer>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {activeModal === 'register' ? 'Register Modal' : 'Login Modal'}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-700 hover:bg-slate-200"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-5">
              <InputField
                label="Email"
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="Enter your email"
                required
              />

              <InputField
                label="Password"
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="Enter your password"
                required
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-200 focus:outline-none"
              >
                {activeModal === 'register' ? 'Register' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactInfo({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-bold tracking-wide text-emerald-700 uppercase">{label}</p>
      <p className="mt-2 text-slate-700">{value}</p>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 transition outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}
