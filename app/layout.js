import './globals.css';

export const metadata = {
  title: 'Müzik Prova Stüdyosu | Online Rezervasyon',
  description: 'Grup ve davul provalarınız için hızlı ve kolay rezervasyon sistemi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
