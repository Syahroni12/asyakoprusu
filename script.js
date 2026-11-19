/* ---------- Page entrance ---------- */
function startPageEntrance() {
  var firstImage = document.querySelector('.slide.active img');
  var ready = !firstImage || firstImage.complete ? Promise.resolve() : new Promise(function(resolve) {
    firstImage.addEventListener('load', resolve, { once: true });
    firstImage.addEventListener('error', resolve, { once: true });
  });
  Promise.race([ready, new Promise(function(resolve) { setTimeout(resolve, 1800); })]).then(function() {
    function reveal() {
      if (document.hidden) {
        document.addEventListener('visibilitychange', function visible() {
          if (!document.hidden) { document.removeEventListener('visibilitychange', visible); reveal(); }
        });
        return;
      }
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { document.body.classList.add('loaded'); });
      });
    }
    reveal();
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPageEntrance, { once: true });
} else {
  startPageEntrance();
}
addEventListener('pageshow', function(event) {
  if (event.persisted) {
    document.body.classList.remove('loaded');
    startPageEntrance();
  }
});
/* ---------- Menu ---------- */
var navbar = document.querySelector('.navbar');
var menu = document.querySelector('.menu-toggle');

function closeMenu() {
  navbar.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
}

menu.addEventListener('click', function() {
  var open = navbar.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.nav-links a').forEach(function(a) { a.addEventListener('click', closeMenu); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', function(e) { if (!navbar.contains(e.target)) closeMenu(); });

/* ---------- Hero slider ---------- */
var INTERVAL = 4000;
var FADE = 900;
var hero = document.querySelector('.hero');
var slides = Array.from(document.querySelectorAll('.slide'));
var dots = Array.from(document.querySelectorAll('.dot'));
var bar = document.querySelector('.progress span');
var pauseBtn = document.querySelector('.pause');
var counter = document.querySelector('.counter');
var current = 0, timer = null, cleanup = null, paused = false, busy = false, started = false;
var zooms = new Map();
function zoom(i) {
  var previous = zooms.get(i);
  if (previous) previous.cancel();
  var img = slides[i].querySelector('img');
  if (!img.animate) return;
  zooms.set(i, img.animate([
    { transform: 'scale(1.05)' }, { transform: 'scale(1)' }
  ], { duration: INTERVAL + FADE, easing: 'linear', fill: 'forwards' }));
}
function restartBar() {
  bar.classList.remove('running');
  void bar.offsetWidth;
  if (!paused && !document.hidden) bar.classList.add('running');
}
function schedule() {
  clearTimeout(timer);
  restartBar();
  pauseBtn.textContent = paused ? '▶' : 'Ⅱ';
  pauseBtn.setAttribute('aria-label', paused ? 'Start slideshow' : 'Pause slideshow');
  if (!paused && !document.hidden && started) timer = setTimeout(function() { go(current + 1); }, INTERVAL);
}
function go(index) {
  var next = (index + slides.length) % slides.length;
  if (busy || next === current) return;
  busy = true;
  var previous = current;
  current = next;
  slides.forEach(function(slide, i) {
    slide.classList.remove('active', 'leaving');
    slide.setAttribute('aria-hidden', String(i !== next));
    dots[i].setAttribute('aria-current', String(i === next));
  });
  slides[previous].classList.add('leaving');
  zoom(next);
  void slides[next].offsetWidth;
  slides[next].classList.add('active');
  counter.textContent = String(next + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  schedule();
  clearTimeout(cleanup);
  cleanup = setTimeout(function() {
    slides[previous].classList.remove('leaving');
    var animation = zooms.get(previous);
    if (animation) animation.cancel();
    busy = false;
  }, FADE + 50);
}
Promise.all(slides.map(function(slide) {
  var img = slide.querySelector('img');
  return (img.decode ? img.decode() : Promise.resolve()).catch(function() {});
})).then(function() { if (!started) { started = true; zoom(0); schedule(); } });
setTimeout(function() { if (!started) { started = true; zoom(0); schedule(); } }, 4000);
document.querySelector('.next').addEventListener('click', function() { go(current + 1); });
document.querySelector('.prev').addEventListener('click', function() { go(current - 1); });
dots.forEach(function(dot, i) { dot.addEventListener('click', function() { go(i); }); });
pauseBtn.addEventListener('click', function() { paused = !paused; schedule(); });
hero.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowRight') { event.preventDefault(); go(current + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(current - 1); }
});
var tx = 0, ty = 0;
hero.addEventListener('touchstart', function(event) { tx = event.changedTouches[0].clientX; ty = event.changedTouches[0].clientY; }, { passive: true });
hero.addEventListener('touchend', function(event) {
  var dx = event.changedTouches[0].clientX - tx;
  var dy = event.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
}, { passive: true });
document.addEventListener('visibilitychange', schedule);
/* ---------- Typing Effect ---------- */
var typingEl = document.getElementById('typing-text');
var phrases = [];
var phraseIdx = 0, charIdx = 0, isDeleting = false;

function typeLoop() {
  if (!typingEl || phrases.length === 0) { setTimeout(typeLoop, 100); return; }
  var full = phrases[phraseIdx];
  if (isDeleting) {
    charIdx--;
    typingEl.textContent = full.substring(0, charIdx);
  } else {
    charIdx++;
    typingEl.textContent = full.substring(0, charIdx);
  }
  var delay = isDeleting ? 35 : 70;
  if (!isDeleting && charIdx === full.length) {
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    delay = 400;
  }
  setTimeout(typeLoop, delay);
}
typeLoop();

/* ---------- Translations ---------- */
var translations = {
  en: {
    brand: 'ASYA KOPRUSU DANISMANLIK',
    nav0: 'Home',
    nav1: 'About Us',
    nav2: 'Our Direction',
    directionEyebrow: 'THE PEOPLE BEHIND THE BRIDGE',
    directionTitle: 'Our Direction',
    directionDescription: 'A shared vision. A personal commitment. Meet the people guiding our journey and connecting opportunities across borders.',
    directionSamplePhoto: 'Sample portrait',
    directorName1: 'Dr. Wesley Go, B.Ac, M.A, M.Pd',
    directorName2: 'Lily Njomin',
    directorName3: 'Victor Nathanael, S.E, M.I.B',
    directorName4: 'Dewi Setyowati',
    directorRole1: 'Chairman',
    directorRole2: 'Chairman',
    directorRole3: 'Co-Chairman',
    directorRole4: 'Marketing Director',
    directionFooter: 'People. Purpose. Possibilities.',
    directionNote: 'Our directors and leadership team.',
    nav3: 'Programs',
    nav4: 'Gallery',
    nav5: 'Contact Us \u2197',
    aboutTitle: 'About Us',
    aboutText: 'Asya Koprusu consulting firm is operating in Turkiye as an extension of MITRA & Wahana Group who has 16 years of experience, recruiting more than 30.000 labors to employers within 9 branch offices all over the world. MITRA & Wahana Group has been accredited by several goverment institutions as one of the best companies in its sector. Our aim is to carry out this experience to Asya Koprusu consulting to build trusted relationship with our partners in Turkiye and give them high quality services with empowered manpower to improve the human quality and welfare of the young generation. With our strategic and strong partner MITRA & Wahana Group, we are happy to provide services in a wide range of areas, focusing on many different sectors, from Tourism to Textile Industry, from Construction Industry to certified SPA therapists.',
    aboutIntro: 'Following are the service that we, Asya Koprusu consulting are able to provide:',
    aboutLi0: 'To provide competent caregivers for all kinds of elderly, children and people in need of care or to act as an intermediary in their transition to another job.',
    aboutLi1: 'Providing care services for the elderly and physically disabled people without providing shelter.',
    aboutLi2: 'Providing outsourced nursing services outside of hospitals.',
    aboutLi3: 'To provide or mediate caregivers for those looking for caregivers on daily, monthly or longer-term contracts.',
    aboutLi4: 'Providing consultancy regarding the provision of help to the families of those in need of care.',
    aboutLi5: 'Providing professional services in many areas, from customer relations to drivers, from gardeners to cleaners, from hotel staff to cooks and from assistants to certified spa therapists.',
    sub1: 'A Subsidiary of',
    sub2: 'Indonesian Manpower Agency (Head Company)',
    groupSmall: '& Group of Company',
    phrases: [
      'Connecting Prospective Talents to Turkiye',
      'Your International Career Bridge',
      'Professional Manpower Solutions',
      'Trusted Partner for the Future'
    ]
  },
  tr: {
    brand: 'ASYA KOPRUSU DANISMANLIK',
    nav0: 'Ana Sayfa',
    nav1: 'Hakk\u0131m\u0131zda',
    nav2: 'Our Direction',
    directionEyebrow: 'KÖPRÜNÜN ARKASINDAKİ İNSANLAR',
    directionTitle: 'Our Direction',
    directionDescription: 'Ortak bir vizyon. Kişisel bir sorumluluk. Yolculuğumuza yön veren ve sınırlar ötesinde fırsatları birleştiren insanlarla tanışın.',
    directionSamplePhoto: 'Örnek portre',
    directorName1: 'Dr. Wesley Go, B.Ac, M.A, M.Pd',
    directorName2: 'Lily Njomin',
    directorName3: 'Victor Nathanael, S.E, M.I.B',
    directorName4: 'Dewi Setyowati',
    directorRole1: 'Başkan',
    directorRole2: 'Başkan',
    directorRole3: 'Eş Başkan',
    directorRole4: 'Pazarlama Direktörü',
    directionFooter: 'İnsan. Amaç. Olanaklar.',
    directionNote: 'Direktörlerimiz ve yönetim ekibimiz.',
    nav3: 'Programlar',
    nav4: 'Galeri',
    nav5: 'Bize Ula\u015f\u0131n \u2197',
    aboutTitle: 'Hakk\u0131m\u0131zda',
    aboutText: 'Asya Koprusu dan\u0131\u015fmanl\u0131k firmas\u0131, 16 y\u0131ll\u0131k deneyime sahip, d\u00fcnya genelinde 9 \u015fube ofisi ile i\u015fverenlere 30.000\'den fazla i\u015f g\u00fcc\u00fc sa\u011flayan MITRA & Wahana Group\'un T\u00fcrkiye\'deki uzant\u0131s\u0131 olarak faaliyet g\u00f6stermektedir. MITRA & Wahana Group, birka\u00e7 devlet kurumu taraf\u0131ndan sekt\u00f6r\u00fcn\u00fcn en iyi \u015firketlerinden biri olarak akredite edilmi\u015ftir. Amac\u0131m\u0131z, bu deneyimi Asya Koprusu dan\u0131\u015fmanl\u0131\u011f\u0131na ta\u015f\u0131yarak T\u00fcrkiye\'deki i\u015f ortaklar\u0131m\u0131zla g\u00fcvenilir ili\u015fkiler kurmak ve gen\u00e7 neslin insan kalitesini ve refah\u0131n\u0131 art\u0131rmak i\u00e7in g\u00fc\u00e7lendirilmi\u015f i\u015f g\u00fcc\u00fc ile y\u00fcksek kaliteli hizmetler sunmakt\u0131r. Stratejik ve g\u00fc\u00e7l\u00fc orta\u011f\u0131m\u0131z MITRA & Wahana Group ile turizmden tekstil end\u00fcstrisine, in\u015faat end\u00fcstrisinden sertifikal\u0131 SPA terapistlerine kadar bir\u00e7ok farkl\u0131 sekt\u00f6re odaklanarak geni\u015f bir yelpazede hizmet sunmaktan mutluluk duyuyoruz.',
    aboutIntro: 'Asya Koprusu dan\u0131\u015fmanl\u0131k olarak sunabildi\u011fimiz hizmetler \u015funlard\u0131r:',
    aboutLi0: 'Her t\u00fcrl\u00fc ya\u015fl\u0131, \u00e7ocuk ve bak\u0131ma muhta\u00e7 ki\u015filer i\u00e7in yetkin bak\u0131c\u0131lar sa\u011flamak veya ba\u015fka bir i\u015fe ge\u00e7i\u015flerinde arac\u0131 olmak.',
    aboutLi1: 'Bar\u0131nak sa\u011flamadan ya\u015fl\u0131lar ve fiziksel engelliler i\u00e7in bak\u0131m hizmetleri sunmak.',
    aboutLi2: 'Hastane d\u0131\u015f\u0131nda d\u0131\u015f kaynakl\u0131 hem\u015firelik hizmetleri sa\u011flamak.',
    aboutLi3: 'G\u00fcnl\u00fck, ayl\u0131k veya daha uzun s\u00fcreli s\u00f6zle\u015fmelerle bak\u0131c\u0131 arayanlara bak\u0131c\u0131 sa\u011flamak veya arac\u0131l\u0131k etmek.',
    aboutLi4: 'Bak\u0131ma ihtiya\u00e7 duyanlar\u0131n ailelerine yard\u0131m sa\u011flanmas\u0131 konusunda dan\u0131\u015fmanl\u0131k vermek.',
    aboutLi5: 'M\u00fc\u015fteri ili\u015fkilerinden \u015fof\u00f6rlere, bah\u00e7\u0131vanlardan temizlik\u00e7ilere, otel personelinden a\u015f\u00e7\u0131lara ve asistanlardan sertifikal\u0131 spa terapistlerine kadar bir\u00e7ok alanda profesyonel hizmetler sunmak.',
    sub1: 'Alt \u015eirketi',
    sub2: 'Endonezya \u0130\u015f G\u00fcc\u00fc Ajans\u0131 (Ana \u015eirket)',
    groupSmall: '& \u015eirket Grubu',
    phrases: [
      'Endonezya Yeteneklerini D\u00fcnyaya Ba\u011fl\u0131yoruz',
      'Uluslararas\u0131 Kariyer K\u00f6pr\u00fcn\u00fcz',
      'Profesyonel \u0130\u015f G\u00fcc\u00fc \u00c7\u00f6z\u00fcmleri',
      'Gelecek \u0130\u00e7in G\u00fcvenilir Ortak'
    ]
  }
};

Object.assign(translations.en, {"servicesEyebrow":"EXPERTISE WITH A HUMAN TOUCH","servicesTitle":"Our Services","servicesIntro":"The right people make all the difference. Discover seven professions supporting the way you live, work and welcome others.","servicesFooter":"Every need starts with a conversation.","servicesCta":"Let us find your people","serviceName1":"Caregiving & Nursing","serviceTag1":"PERSONAL CARE","serviceText1":"Thoughtful support for children, older adults and people who need a helping hand in everyday life.","serviceName2":"Nanny","serviceTag2":"HEALTHCARE","serviceText2":"Nursing support outside the hospital, with attention to comfort and individual care needs.","serviceName3":"Hospitality","serviceTag3":"HOSPITALITY","serviceText3":"Welcoming people for front office, guest relations and the everyday rhythm of hotel operations.","serviceName4":"Food & Beverages Production","serviceTag4":"CULINARY","serviceText4":"Kitchen professionals bringing care, consistency and creativity to every service.","serviceName5":"Manufacturing","serviceTag5":"TRANSPORT","serviceText5":"Drivers supporting daily travel, family schedules and business transport needs.","serviceName6":"Agriculture","serviceTag6":"PROPERTY CARE","serviceText6":"Cleaning and housekeeping support to keep homes, workplaces and guest spaces in good order.","serviceName7":"Spa and Body Therapist","serviceTag7":"WELLNESS","serviceText7":"Certified spa therapists for attentive treatments and a calm, considered guest experience."});
Object.assign(translations.tr, {"servicesEyebrow":"İNSAN ODAKLI UZMANLIK","servicesTitle":"Hizmetlerimiz","servicesIntro":"Doğru insanlar fark yaratır. Yaşamınızı, işinizi ve misafirlerinizi destekleyen yedi meslek alanını keşfedin.","servicesFooter":"Her ihtiyaç bir konuşmayla başlar.","servicesCta":"İhtiyacınıza uygun kişileri bulalım","serviceName1":"Caregiving & Nursing","serviceTag1":"KİŞİSEL BAKIM","serviceText1":"Çocuklar, yaşlılar ve günlük yaşamda yardıma ihtiyaç duyan kişiler için özenli destek.","serviceName2":"Nanny","serviceTag2":"SAĞLIK","serviceText2":"Konfor ve kişisel bakım ihtiyaçlarına odaklanan hastane dışı hemşirelik desteği.","serviceName3":"Hospitality","serviceTag3":"KONAKLAMA","serviceText3":"Ön büro, misafir ilişkileri ve günlük otel operasyonları için personel.","serviceName4":"Food & Beverages Production","serviceTag4":"MUTFAK","serviceText4":"Her servise özen, tutarlılık ve yaratıcılık katan mutfak profesyonelleri.","serviceName5":"Manufacturing","serviceTag5":"ULAŞIM","serviceText5":"Günlük seyahat, aile programları ve iş ulaşımı ihtiyaçları için şoförler.","serviceName6":"Agriculture","serviceTag6":"TESİS BAKIMI","serviceText6":"Evleri, iş yerlerini ve misafir alanlarını düzenli tutan temizlik desteği.","serviceName7":"Spa and Body Therapist","serviceTag7":"SPA VE BAKIM","serviceText7":"Özenli uygulamalar ve sakin bir misafir deneyimi için sertifikalı spa terapistleri."});

Object.assign(translations.en, {
  partnersEyebrow: 'STRONGER TOGETHER',
  partnersTitle: 'Our Partner',
  partnersDescription: 'Shared ambition. Lasting connections. The group behind our journey across borders.',
  partnersNote: 'Our partner hotels and hospitality groups.',
  partnersPause: 'Pause movement',
  partnersResume: 'Resume movement'
});
Object.assign(translations.tr, {
  partnersEyebrow: 'BIRLIKTE DAHA GUCLU',
  partnersTitle: 'Ortaklarimiz',
  partnersDescription: 'Ortak hedefler. Kalici baglantilar. Sinirlar otesindeki yolculugumuzun arkasindaki grup.',
  partnersNote: 'Partner otellerimiz ve konaklama gruplarimiz.',
  partnersPause: 'Hareketi durdur',
  partnersResume: 'Hareketi devam ettir'
});
Object.assign(translations.en, {
  navServices: 'Our Services', navPartners: 'Our Partner',
  galleryEyebrow: 'A CLOSER LOOK', galleryTitle: 'Gallery',
  galleryDescription: 'Explore our training activities and preparations for professional opportunities.',
  galleryCategory: 'TRAINING ACTIVITIES',
  gallerySpaTraining: 'Spa Therapist Training', galleryStewardTraining: 'Steward Training', galleryWorkTraining: 'Work Training for Turkey',
  galleryNote: 'Select a photo to take a closer look at our training activities.',
  galleryClose: 'Close'
});
Object.assign(translations.tr, {
  navServices: 'Hizmetlerimiz', navPartners: 'Ortaklarimiz',
  galleryEyebrow: 'YAKINDAN BAKIN', galleryTitle: 'Galeri',
  galleryDescription: 'Egitim faaliyetlerimizi ve mesleki firsatlara hazirlik surecimizi kesfedin.',
  galleryCategory: 'EGITIM FAALIYETLERI',
  gallerySpaTraining: 'Spa Terapisti Egitimi', galleryStewardTraining: 'Steward Egitimi', galleryWorkTraining: 'Turkiye Icin Mesleki Egitim',
  galleryNote: 'Egitim faaliyetlerimize yakindan bakmak icin bir fotograf secin.',
  galleryClose: 'Kapat'
});
Object.assign(translations.en, {
  contactEyebrow: "LET'S BUILD A CONNECTION",
  contactTitle: 'Contact Us',
  contactDescription: 'Your next opportunity starts with a conversation. Get in touch with our team in Istanbul.',
  contactOffice: 'Office Address', contactPeople: 'Contact Person',
  contactMap: 'View on map', contactPhone: 'PHONE', contactEmail: 'EMAIL',
  contactDewiRole: 'Marketing Director', contactZahraRole: 'Administrative Consultant',
  contactSignoff: 'Connecting people. Opening possibilities.'
});
Object.assign(translations.tr, {
  contactEyebrow: 'BIR BAGLANTI KURALIM',
  contactTitle: 'Bize Ulasin',
  contactDescription: 'Bir sonraki firsatiniz bir konusmayla baslar. Istanbul ekibimizle iletisime gecin.',
  contactOffice: 'Ofis Adresi', contactPeople: 'Iletisim Kisisi',
  contactMap: 'Haritada goruntule', contactPhone: 'TELEFON', contactEmail: 'E-POSTA',
  contactDewiRole: 'Pazarlama Direktoru', contactZahraRole: 'Idari Danisman',
  contactSignoff: 'Insanlari birlestirir. Firsatlar acar.'
});
function applyLang(lang) {
  var t = translations[lang];
  if (!t) return;
  document.documentElement.lang = lang;

  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var key = els[i].getAttribute('data-i18n');
    if (t[key] !== undefined) {
      els[i].textContent = t[key];
    }
  }

  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.textContent = 'Asya Koprusu Danismanlik';

  phrases.length = 0;
  for (var j = 0; j < t.phrases.length; j++) {
    phrases.push(t.phrases[j]);
  }
  phraseIdx = 0;
  charIdx = 0;
  isDeleting = false;
  if (typingEl) typingEl.textContent = '';
}

var langRadios = document.querySelectorAll('input[name="lang"]');
for (var r = 0; r < langRadios.length; r++) {
  langRadios[r].addEventListener('change', function(e) { applyLang(e.target.value); });
}

applyLang('en');

/* ---------- Smooth scroll reveals ---------- */
var motionPreference = { matches: false, addEventListener: function() {} };
var revealElements = Array.from(document.querySelectorAll('[data-anim]'));
var revealObserver;
var revealAnimations = new Map();

function revealElement(el) {
  el.classList.add('in');
  var oldAnimation = revealAnimations.get(el);
  if (oldAnimation) oldAnimation.cancel();
  if (motionPreference.matches || !el.animate) return;

  var type = el.dataset.anim;
  var start = 'translate3d(0, 32px, 0)';
  if (type === 'left') start = 'translate3d(-40px, 0, 0)';
  if (type === 'right') start = 'translate3d(40px, 0, 0)';
  if (type === 'zoom') start = 'translate3d(0, 24px, 0) scale(.88)';
  if (type === 'pop') start = 'translate3d(0, 24px, 0) scale(.92)';
  if (type === 'line') start = 'scaleX(0)';
  var delayValue = getComputedStyle(el).getPropertyValue('--d').trim();
  var delay = parseFloat(delayValue) || 0;
  if (!delayValue.endsWith('ms')) delay *= 1000;
  var animation = el.animate([
    { opacity: 0, transform: start },
    { opacity: 1, transform: 'none' }
  ], {
    duration: type === 'zoom' ? 1100 : 850,
    delay: Math.min(delay, 300),
    easing: 'cubic-bezier(.22, 1, .36, 1)',
    fill: 'backwards'
  });
  revealAnimations.set(el, animation);
  animation.onfinish = function() { revealAnimations.delete(el); };
}

function setupReveals() {
  if (revealObserver) revealObserver.disconnect();
  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    revealElements.forEach(function(el) {
      el.classList.add('in');
      var animation = revealAnimations.get(el);
      if (animation) animation.cancel();
    });
    revealAnimations.clear();
    return;
  }
  revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        if (!entry.target.classList.contains('in')) revealElement(entry.target);
      } else if (entry.boundingClientRect.top > innerHeight + 48) {
        // Replay only after the element has moved fully below the viewport.
        var animation = revealAnimations.get(entry.target);
        if (animation) animation.cancel();
        revealAnimations.delete(entry.target);
        entry.target.classList.remove('in');
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  revealElements.forEach(function(el) { revealObserver.observe(el); });
}
setupReveals();

/* ---------- Scroll progress and gentle hero parallax ---------- */
var ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(function() {
    var h = document.documentElement.scrollHeight - innerHeight;
    navbar.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h) : 0);
    navbar.classList.toggle('scrolled', scrollY > 10);
    updateSectionNavigation();
    var heroRect = hero.getBoundingClientRect();
    var offset = motionPreference.matches ? 0 :
      Math.min(heroRect.height * .12, Math.max(0, -heroRect.top) * .12);
    hero.style.setProperty('--hero-shift', offset.toFixed(1) + 'px');
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
motionPreference.addEventListener('change', function() {


  setupReveals();
  onScroll();
});
onScroll();

/* ---------- Slow, seamless partner marquee ---------- */
var partnerMarquee = document.querySelector('.partner-marquee');
var partnerTrack = document.querySelector('.partner-track');
var partnerGroup = document.querySelector('.partner-group');
var partnerPause = document.querySelector('.partners-pause');
if (partnerMarquee && partnerTrack && partnerGroup && partnerPause) {
  var partnerClone = partnerGroup.cloneNode(true);
  partnerClone.setAttribute('aria-hidden', 'true');
  partnerClone.removeAttribute('aria-label');
  partnerTrack.appendChild(partnerClone);

  function sizePartnerMarquee() {
    // Keep a steady 22 pixels per second on desktop and mobile.
    partnerTrack.style.setProperty('--partner-duration', (partnerGroup.getBoundingClientRect().width / 22).toFixed(2) + 's');
  }
  sizePartnerMarquee();
  if ('ResizeObserver' in window) {
    new ResizeObserver(sizePartnerMarquee).observe(partnerGroup);
  } else {
    addEventListener('resize', sizePartnerMarquee);
  }
  partnerPause.addEventListener('click', function() {
    var paused = partnerMarquee.classList.toggle('is-paused');
    partnerPause.setAttribute('aria-pressed', String(paused));
    partnerPause.querySelector('.partners-pause-icon').textContent = paused ? '▶' : 'Ⅱ';
    var label = partnerPause.querySelector('[data-i18n]');
    var key = paused ? 'partnersResume' : 'partnersPause';
    label.dataset.i18n = key;
    label.textContent = translations[document.documentElement.lang][key];
  });
}
/* ---------- Section navigation ---------- */
function updateSectionNavigation() {
  var links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  var marker = scrollY + navbar.offsetHeight + 70;
  var activeLink = links[0];
  links.forEach(function(link) {
    var section = document.querySelector(link.getAttribute('href'));
    if (section && section.offsetTop <= marker) activeLink = link;
  });
  links.forEach(function(link) {
    var active = link === activeLink;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

/* ---------- Gallery lightbox ---------- */
var galleryDialog = document.querySelector('.gallery-dialog');
var galleryTiles = Array.from(document.querySelectorAll('.gallery-tile'));
var galleryIndex = 0;
var galleryOpener;
function showGalleryPhoto(index) {
  galleryIndex = (index + galleryTiles.length) % galleryTiles.length;
  var tile = galleryTiles[galleryIndex];
  var source = tile.querySelector('img');
  var image = galleryDialog.querySelector('.gallery-dialog-image');
  image.src = source.src;
  image.alt = source.alt;
  galleryDialog.querySelector('#gallery-dialog-caption').textContent = '';
  galleryDialog.querySelector('.gallery-dialog-counter').textContent = String(galleryIndex + 1).padStart(2, '0') + ' / ' + String(galleryTiles.length).padStart(2, '0');
}
galleryTiles.forEach(function(tile, index) {
  tile.addEventListener('click', function() {
    galleryOpener = tile;
    showGalleryPhoto(index);
    galleryDialog.showModal();
    document.body.classList.add('gallery-open');
  });
});
galleryDialog.querySelector('.gallery-dialog-close').addEventListener('click', function() { galleryDialog.close(); });
galleryDialog.querySelector('.gallery-dialog-prev').addEventListener('click', function() { showGalleryPhoto(galleryIndex - 1); });
galleryDialog.querySelector('.gallery-dialog-next').addEventListener('click', function() { showGalleryPhoto(galleryIndex + 1); });
galleryDialog.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowRight') { event.preventDefault(); showGalleryPhoto(galleryIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showGalleryPhoto(galleryIndex - 1); }
});
galleryDialog.addEventListener('click', function(event) {
  if (event.target === galleryDialog) {
    var rect = galleryDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) galleryDialog.close();
  }
});
galleryDialog.addEventListener('close', function() {
  document.body.classList.remove('gallery-open');
  if (galleryOpener) galleryOpener.focus({ preventScroll: true });
});