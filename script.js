const weddingDate = new Date('2026-12-05T12:00:00+08:00');

function updateCountdown() {
  const remaining = Math.max(0, weddingDate - new Date());
  const units = [86400000, 3600000, 60000, 1000];
  const ids = ['days', 'hours', 'minutes', 'seconds'];

  let value = remaining;

  units.forEach((unit, index) => {
    const amount = Math.floor(value / unit);
    const element = document.getElementById(ids[index]);
    const nextValue = String(amount).padStart(2, '0');

    if (element.dataset.value !== nextValue) {
      const previousValue = element.dataset.value;

      element.dataset.value = nextValue;

      element.innerHTML = previousValue
        ? `<span class="count-value leaving">${previousValue}</span><span class="count-value entering">${nextValue}</span>`
        : `<span class="count-value current">${nextValue}</span>`;
    }

    value %= unit;
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* =========================================================
   婚禮日期日曆
   ========================================================= */

const dates = document.getElementById('calendar-dates');

const firstDay = new Date(2026, 11, 1).getDay();

for (let i = 0; i < firstDay; i++) {
  dates.append(document.createElement('span'));
}

for (let day = 1; day <= 31; day++) {
  const el = document.createElement('span');

  el.textContent = day;

  if (day === 5) {
    el.className = 'wedding-day';
  }

  dates.append(el);
}


/* =========================================================
   照片輪播
   ========================================================= */

const slides = [...document.querySelectorAll('.slide')];
const counter = document.querySelector('.carousel-controls b');

let current = 0;
let autoSlide;

function showSlide(next) {
  current = (next + slides.length) % slides.length;

  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === current);
  });

  counter.textContent = String(current + 1).padStart(2, '0');
}

function restartCarousel() {
  clearInterval(autoSlide);

  autoSlide = setInterval(() => {
    showSlide(current + 1);
  }, 4800);
}

document.querySelector('.next').addEventListener('click', () => {
  showSlide(current + 1);
  restartCarousel();
});

document.querySelector('.previous').addEventListener('click', () => {
  showSlide(current - 1);
  restartCarousel();
});

restartCarousel();


/* =========================================================
   滾動顯示動畫
   ========================================================= */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14
  }
);

document.querySelectorAll('.reveal').forEach((section) => {
  revealObserver.observe(section);
});


/* =========================================================
   背景音樂
   使用 music/mv.mp3
   ========================================================= */

const soundButton = document.querySelector('.sound-toggle');

/*
 * 背景音樂檔案
 *
 * 網站結構：
 *
 * index.html
 * music/
 *   └── mv.mp3
 *
 * 因此路徑使用：
 *
 * music/mv.mp3
 */
const backgroundMusic = new Audio('music/mv.mp3');

/*
 * 音樂播放完畢後重新播放
 */
backgroundMusic.loop = true;

/*
 * 音量
 *
 * 0.0 = 靜音
 * 0.3 = 30%
 * 0.5 = 50%
 * 0.8 = 80%
 * 1.0 = 100%
 */
backgroundMusic.volume = 0.8;


/*
 * 音樂目前是否正在播放
 */
let musicOn = false;


/*
 * =========================================================
 * 開啟 / 關閉背景音樂
 * =========================================================
 */

async function setMusic(shouldPlay) {
  if (shouldPlay) {
    try {
      /*
       * 開始播放 MP3
       */
      await backgroundMusic.play();

      musicOn = true;

      /*
       * 更新音樂按鈕外觀
       */
      soundButton.classList.add('playing');
      soundButton.classList.remove('muted');

      /*
       * 更新無障礙屬性
       */
      soundButton.setAttribute(
        'aria-label',
        '關閉背景音樂'
      );

      soundButton.setAttribute(
        'aria-pressed',
        'true'
      );

    } catch (error) {
      /*
       * 瀏覽器可能會禁止網頁自動播放音樂。
       *
       * 這不是 MP3 路徑錯誤，
       * 而是 Chrome / Safari 等瀏覽器的自動播放限制。
       */
      console.warn(
        '背景音樂目前無法自動播放，等待使用者與網頁互動後再播放。',
        error
      );

      musicOn = false;

      soundButton.classList.remove('playing');
      soundButton.classList.add('muted');

      soundButton.setAttribute(
        'aria-label',
        '開啟背景音樂'
      );

      soundButton.setAttribute(
        'aria-pressed',
        'false'
      );
    }

  } else {
    /*
     * 暫停音樂
     */
    backgroundMusic.pause();

    musicOn = false;

    /*
     * 更新音樂按鈕外觀
     */
    soundButton.classList.remove('playing');
    soundButton.classList.add('muted');

    /*
     * 更新無障礙屬性
     */
    soundButton.setAttribute(
      'aria-label',
      '開啟背景音樂'
    );

    soundButton.setAttribute(
      'aria-pressed',
      'false'
    );
  }
}


/*
 * =========================================================
 * 音樂按鈕
 * =========================================================
 */

soundButton.addEventListener('click', () => {
  setMusic(!musicOn);
});


/*
 * =========================================================
 * 網站載入後嘗試自動播放
 * =========================================================
 *
 * 如果瀏覽器允許自動播放：
 *
 *     網站開啟
 *        ↓
 *     mv.mp3 自動播放
 *
 *
 * 如果瀏覽器禁止：
 *
 *     網站開啟
 *        ↓
 *     自動播放被瀏覽器阻止
 *        ↓
 *     等使用者第一次點擊網站
 *        ↓
 *     mv.mp3 開始播放
 *
 */

setMusic(true);


/*
 * =========================================================
 * 使用者第一次與網站互動
 * =========================================================
 *
 * 用 pointerdown 可以涵蓋：
 *
 * - 滑鼠
 * - 手機觸控
 * - 平板觸控
 * - 觸控筆
 *
 * 如果瀏覽器之前禁止自動播放，
 * 使用者第一次碰觸網站時就嘗試播放音樂。
 *
 */

document.addEventListener(
  'pointerdown',
  () => {
    if (!musicOn) {
      setMusic(true);
    }
  },
  {
    once: true
  }
);