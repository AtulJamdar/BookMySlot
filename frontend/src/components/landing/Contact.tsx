import React, { useState } from 'react';
import { toast } from 'sonner';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all contact form fields');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      toast.success('Your message has been sent! We will contact you soon.');
      setName('');
      setEmail('');
      setMessage('');
      setIsSending(false);
    }, 1000);
  };

  return (
    <section className="min-h-screen flex flex-col justify-center bg-white dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-zinc-900 font-sans py-16">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full">
        
        {/* Left column info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Connect With Us
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed max-w-md">
              Have questions about multi-tenant isolation, customized scheduler workflows, or API integrations? Drop us a line and our tech squad will reach out.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>Koregaon Park, Pune, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <Phone className="h-4 w-4 text-amber-500" />
              <span>+91 72193 68340</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <Mail className="h-4 w-4 text-amber-500" />
              <span>support@bookmyslot.in</span>
            </div>
          </div>
        </div>

        {/* Right column glassmorphic form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl shadow-xl shadow-amber-500/2 space-y-4 relative"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold tracking-wider text-zinc-500 dark:text-zinc-550 uppercase">Name</label>
            <input
              type="text"
              required
              placeholder="Atul Jamdar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold tracking-wider text-zinc-500 dark:text-zinc-550 uppercase">Email Address</label>
            <input
              type="email"
              required
              placeholder="atul.jamdar@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold tracking-wider text-zinc-500 dark:text-zinc-550 uppercase">Message</label>
            <textarea
              required
              rows={4}
              placeholder="Write your query here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-zinc-950 font-bold rounded text-xs transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            {isSending ? 'Sending...' : 'Send Message'}
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
