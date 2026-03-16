document.addEventListener('DOMContentLoaded', function () {
  // ── Dot-Matrix Pixel Font (5×7) ──
  var FONT = {
    'Y': [
      '10001',
      '01010',
      '00100',
      '00100',
      '00100',
      '00100',
      '00100'
    ],
    'i': [
      '00100',
      '00000',
      '00100',
      '00100',
      '00100',
      '00100',
      '00100'
    ],
    'c': [
      '00000',
      '00000',
      '01110',
      '10000',
      '10000',
      '10001',
      '01110'
    ],
    'h': [
      '10000',
      '10000',
      '10110',
      '11001',
      '10001',
      '10001',
      '10001'
    ],
    'e': [
      '00000',
      '00000',
      '01110',
      '10001',
      '11111',
      '10000',
      '01110'
    ],
    'n': [
      '00000',
      '00000',
      '10110',
      '11001',
      '10001',
      '10001',
      '10001'
    ],
    'T': [
      '11111',
      '00100',
      '00100',
      '00100',
      '00100',
      '00100',
      '00100'
    ],
    'a': [
      '00000',
      '00000',
      '01110',
      '00001',
      '01111',
      '10001',
      '01111'
    ],
    'o': [
      '00000',
      '00000',
      '01110',
      '10001',
      '10001',
      '10001',
      '01110'
    ],
    ' ': [
      '00000',
      '00000',
      '00000',
      '00000',
      '00000',
      '00000',
      '00000'
    ]
  };

  // ── Dot-Matrix Canvas Renderer ──
  var splash = document.getElementById('terminal-splash');
  var canvas = document.getElementById('dot-matrix-canvas');

  if (splash && canvas) {
    var ctx = canvas.getContext('2d');
    var NAME = 'Yichen Tao';
    var BASE_DOT_RADIUS = 3;
    var BASE_DOT_SPACING = 8;
    var CHAR_GAP = 2;
    var ROWS = 7;
    var COLS_PER_CHAR = 5;

    var COLOR_LIT = '#7f5af0';
    var COLOR_GLOW = 'rgba(127,90,240,0.6)';
    var COLOR_GHOST = 'rgba(255,255,255,0.03)';

    // Compute total grid columns
    var totalCols = 0;
    for (var ci = 0; ci < NAME.length; ci++) {
      totalCols += COLS_PER_CHAR;
      if (ci < NAME.length - 1) totalCols += CHAR_GAP;
    }
    totalCols += COLS_PER_CHAR + CHAR_GAP; // cursor column block

    var naturalWidth = totalCols * BASE_DOT_SPACING;
    var naturalHeight = ROWS * BASE_DOT_SPACING;

    var revealedChars = 0;
    var cursorVisible = true;
    var cursorBlinkInterval = null;
    var scaleFactor = 1;

    function getScale() {
      var containerWidth = splash.parentElement ? splash.parentElement.clientWidth : window.innerWidth;
      return Math.min(1, containerWidth / naturalWidth);
    }

    function sizeCanvas() {
      scaleFactor = getScale();
      var dpr = window.devicePixelRatio || 1;
      var w = naturalWidth * scaleFactor;
      var h = naturalHeight * scaleFactor;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawDotMatrix() {
      var dotSpacing = BASE_DOT_SPACING * scaleFactor;
      var dotRadius = BASE_DOT_RADIUS * scaleFactor;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var col = 0;
      for (var ci = 0; ci < NAME.length; ci++) {
        var glyph = FONT[NAME[ci]];
        if (!glyph) { col += COLS_PER_CHAR + CHAR_GAP; continue; }
        var isRevealed = ci < revealedChars;

        for (var row = 0; row < ROWS; row++) {
          for (var gc = 0; gc < COLS_PER_CHAR; gc++) {
            var lit = isRevealed && glyph[row][gc] === '1';
            var x = (col + gc) * dotSpacing + dotSpacing / 2;
            var y = row * dotSpacing + dotSpacing / 2;

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

            if (lit) {
              ctx.shadowBlur = 12 * scaleFactor;
              ctx.shadowColor = COLOR_GLOW;
              ctx.fillStyle = COLOR_LIT;
            } else {
              ctx.shadowBlur = 0;
              ctx.shadowColor = 'transparent';
              ctx.fillStyle = COLOR_GHOST;
            }
            ctx.fill();
          }
        }
        col += COLS_PER_CHAR;
        if (ci < NAME.length - 1) col += CHAR_GAP;
      }

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Draw cursor after last revealed character
      if (cursorVisible && revealedChars > 0) {
        var cursorCol = 0;
        for (var k = 0; k < revealedChars && k < NAME.length; k++) {
          cursorCol += COLS_PER_CHAR;
          if (k < NAME.length - 1) cursorCol += CHAR_GAP;
        }
        ctx.shadowBlur = 12 * scaleFactor;
        ctx.shadowColor = COLOR_GLOW;
        ctx.fillStyle = COLOR_LIT;
        for (var row = 0; row < ROWS; row++) {
          var x = cursorCol * dotSpacing + dotSpacing / 2;
          var y = row * dotSpacing + dotSpacing / 2;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
    }

    sizeCanvas();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealedChars = NAME.length;
      cursorVisible = true;
      drawDotMatrix();
    } else {
      // CRT power-on
      splash.classList.add('terminal-crt-on');

      setTimeout(function () {
        function revealNext() {
          if (revealedChars < NAME.length) {
            revealedChars++;
            drawDotMatrix();
            setTimeout(revealNext, 80 + Math.random() * 40);
          } else {
            // Start cursor blink
            cursorBlinkInterval = setInterval(function () {
              cursorVisible = !cursorVisible;
              drawDotMatrix();
            }, 500);
          }
        }
        revealNext();
      }, 800);
    }

    // Responsive resize (debounced)
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        sizeCanvas();
        drawDotMatrix();
      }, 200);
    });
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
