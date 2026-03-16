document.addEventListener('DOMContentLoaded', function () {
  // ── Terminal Splash Animation ──
  var splash = document.getElementById('terminal-splash');
  var splashText = document.getElementById('terminal-text');
  var splashCursor = document.getElementById('terminal-cursor');

  if (splash && splashText && splashCursor) {
    var name = 'Yichen Tao';
    var charIndex = 0;
    var glitchPoints = [2, 5, 8]; // indices where glitch occurs

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      splashText.textContent = name;
    } else {
      // CRT power-on
      splash.classList.add('terminal-crt-on');

      setTimeout(function() {
        function typeChar() {
          if (charIndex < name.length) {
            splashText.textContent = name.substring(0, charIndex + 1);
            charIndex++;

            // Random glitch at certain characters
            if (glitchPoints.includes(charIndex)) {
              splash.classList.add('terminal-glitch');
              setTimeout(function() {
                splash.classList.remove('terminal-glitch');
              }, 150);
            }

            setTimeout(typeChar, 80 + Math.random() * 40); // slight randomness
          }
        }
        typeChar();
      }, 800); // delay after CRT-on
    }
  }

  // ── Typing Animation ──
  var typingEl = document.getElementById('typing-text');
  if (typingEl) {
    var phrases = [
      'Deep Learning Researcher',
      'Temporal Modeling',
      'Survival Analysis',
      'AI for Health'
    ];
    var phraseIndex = 0;
    var typingCharIndex = 0;
    var isDeleting = false;
    var typeSpeed = 100;

    function typeLoop() {
      var current = phrases[phraseIndex];

      if (isDeleting) {
        typingEl.textContent = current.substring(0, typingCharIndex - 1);
        typingCharIndex--;
      } else {
        typingEl.textContent = current.substring(0, typingCharIndex + 1);
        typingCharIndex++;
      }

      var delay = isDeleting ? 50 : typeSpeed;

      if (!isDeleting && typingCharIndex === current.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && typingCharIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 500;
      }

      setTimeout(typeLoop, delay);
    }

    typeLoop();
  }

  // ── Nav Toggle (Mobile) ──
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ── Active Nav Highlighting ──
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');

  if (sections.length && navAnchors.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.classList.remove('active');
            if (a.getAttribute('href').includes('#' + id)) {
              a.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -60% 0px' });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
});
