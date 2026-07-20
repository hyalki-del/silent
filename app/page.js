'use client';

import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, Music, User, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [selectedService, setSelectedService] = useState('band'); // 'band' or 'drum'
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' or 'credit'
  const [credits, setCredits] = useState({ band: 3, drum: 0 }); // Simüle edilen bakiyeler
  const [isBooked, setIsBooked] = useState(false);

  const times = ['14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '18:00 - 19:00', '20:00 - 21:00'];

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedTime) return alert('Lütfen bir saat seçin.');

    if (paymentType === 'credit') {
      const currentCredit = selectedService === 'band' ? credits.band : credits.drum;
      if (currentCredit < 1) {
        return alert('Seçtiğiniz hizmet için yeterli paket krediniz yok.');
      }
      setCredits(prev => ({
        ...prev,
        [selectedService]: prev[selectedService] - 1
      }));
    }

    setIsBooked(true);
  };

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Music className="w-8 h-8 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-wide">STÜDYO RİTİM</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
          <User className="w-4 h-4 text-slate-400" />
          <span>Kullanıcı Hesabı (Müzisyen)</span>
        </div>
      </header>

      {/* Hero & Fırsat Banner */}
      <section className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-6 rounded-2xl border border-indigo-500/30">
        <h2 className="text-2xl font-bold mb-2">4 Ders Alana 1 Ders Bedava! 🎁</h2>
        <p className="text-slate-300 text-sm sm:text-base">
          Stüdyoda vereceğiniz ilk toplu nakit ödemede hesabınıza <strong className="text-indigo-400">5 Prova Kredisi</strong> yüklenir. Kredilerinizi online randevularda sorunsuz kullanabilirsiniz.
        </p>
      </section>

      {/* Bakiyelerim Paneli */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">Grup Prova Krediniz</p>
            <p className="text-2xl font-bold text-indigo-400">{credits.band} Prova</p>
          </div>
          <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800">
            Kullanılabilir
          </span>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">Davul Prova Krediniz</p>
            <p className="text-2xl font-bold text-emerald-400">{credits.drum} Prova</p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">
            Kredi Yok
          </span>
        </div>
      </section>

      {/* Rezervasyon Formu */}
      {!isBooked ? (
        <form onSubmit={handleBooking} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Online Prova Rezervasyonu</span>
          </h3>

          {/* 1. Hizmet Seçimi */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">1. Hizmet Türü</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedService('band')}
                className={`p-4 rounded-xl border text-left flex justify-between items-center transition ${
                  selectedService === 'band'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className="font-semibold text-white">Standart Grup Provası</p>
                  <p className="text-xs text-slate-400">1500 TL / Saat</p>
                </div>
                {selectedService === 'band' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedService('drum')}
                className={`p-4 rounded-xl border text-left flex justify-between items-center transition ${
                  selectedService === 'drum'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className="font-semibold text-white">Sadece Davul Provası</p>
                  <p className="text-xs text-slate-400">900 TL / Saat</p>
                </div>
                {selectedService === 'drum' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* 2. Saat Seçimi */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">2. Müsait Saatler</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {times.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-2.5 rounded-lg border text-sm flex items-center justify-center space-x-1.5 transition ${
                    selectedTime === time
                      ? 'border-indigo-500 bg-indigo-600 text-white font-medium'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Ödeme Tipi */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">3. Ödeme Seçeneği</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentType === 'cash'}
                  onChange={() => setPaymentType('cash')}
                  className="accent-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium">Stüdyoda Nakit Ödeme</p>
                  <p className="text-xs text-slate-400">
                    {selectedService === 'band' ? '1500 TL' : '900 TL'} prova sonrası ödenir.
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentType === 'credit'}
                  onChange={() => setPaymentType('credit')}
                  className="accent-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium">Paket Kredisi Kullan</p>
                  <p className="text-xs text-slate-400">
                    Mevcut Kredi: {selectedService === 'band' ? credits.band : credits.drum} Hak
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            Rezervasyonu Onayla
          </button>
        </form>
      ) : (
        /* Başarılı Onay Ekranı */
        <div className="bg-slate-900 p-8 rounded-2xl border border-emerald-500/30 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Rezervasyon Oluşturuldu!</h3>
          <div className="text-slate-300 text-sm max-w-sm mx-auto space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p><strong>Hizmet:</strong> {selectedService === 'band' ? 'Grup Provası' : 'Davul Provası'}</p>
            <p><strong>Saat:</strong> {selectedTime}</p>
            <p><strong>Ödeme Türü:</strong> {paymentType === 'cash' ? 'Stüdyoda Nakit' : 'Paket Kredisi (Düşüldü)'}</p>
          </div>
          <button
            onClick={() => {
              setIsBooked(false);
              setSelectedTime('');
            }}
            className="text-sm text-indigo-400 hover:underline"
          >
            + Yeni Rezervasyon Yap
          </button>
        </div>
      )}
    </main>
  );
}
