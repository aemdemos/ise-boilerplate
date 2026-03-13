/**
 * Reusable slider: scroll-to-slide, prev/next, indicators, and active-state sync.
 * Does not create DOM; call initSlider(block, options) after the block's slides/controls exist.
 *
 * Options (all optional; defaults match carousel block):
 * - slidesContainer: selector for the scrollable container (e.g. '.carousel-slides')
 * - slideSelector: selector for each slide (e.g. '.carousel-slide')
 * - indicatorsContainer: selector for the indicators list (e.g. '.carousel-slide-indicators')
 * - indicatorItemSelector: selector for each indicator item with data-target-slide (e.g. '.carousel-slide-indicator')
 * - prevSelector: selector for previous button (e.g. '.slide-prev')
 * - nextSelector: selector for next button (e.g. '.slide-next')
 * - activeSlideAttr: block dataset key for current index (e.g. 'activeSlide')
 * - targetSlideAttr: indicator item dataset key for target index (e.g. 'targetSlide')
 * - slideIndexAttr: slide dataset key for its index (e.g. 'slideIndex')
 */

const DEFAULT_OPTIONS = {
  slidesContainer: '.carousel-slides',
  slideSelector: '.carousel-slide',
  indicatorsContainer: '.carousel-slide-indicators',
  indicatorItemSelector: '.carousel-slide-indicator',
  prevSelector: '.slide-prev',
  nextSelector: '.slide-next',
  activeSlideAttr: 'activeSlide',
  targetSlideAttr: 'targetSlide',
  slideIndexAttr: 'slideIndex',
};

/**
 * Updates block and slide/indicator state to reflect the active slide.
 * @param {Element} block - Root block element
 * @param {Element} slide - The slide that is active
 * @param {Object} options - Selector/dataset options (see DEFAULT_OPTIONS)
 */
export function updateActiveSlide(block, slide, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const slideIndex = parseInt(slide.dataset[opts.slideIndexAttr], 10);
  if (Number.isNaN(slideIndex)) return;
  block.dataset[opts.activeSlideAttr] = slideIndex;

  const slides = block.querySelectorAll(opts.slideSelector);
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll(opts.indicatorItemSelector);
  indicators.forEach((indicator, idx) => {
    const btn = indicator.querySelector('button');
    if (!btn) return;
    if (idx !== slideIndex) {
      btn.removeAttribute('disabled');
    } else {
      btn.setAttribute('disabled', 'true');
    }
  });
}

/**
 * Scrolls the slider to the given slide index (with wrap).
 * @param {Element} block - Root block element
 * @param {number} slideIndex - Desired slide index
 * @param {string} behavior - 'smooth' or 'auto'
 * @param {Object} options - Selector options
 */
export function showSlide(block, slideIndex = 0, behavior = 'smooth', options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const container = block.querySelector(opts.slidesContainer);
  const slides = block.querySelectorAll(opts.slideSelector);
  if (!container || !slides.length) return;

  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  container.scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

/**
 * Binds indicator clicks, prev/next buttons, and IntersectionObserver to sync active state.
 * @param {Element} block - Root block element
 * @param {Object} options - Selector/dataset options
 */
function bindEvents(block, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const slideIndicators = block.querySelector(opts.indicatorsContainer);
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const indicator = e.currentTarget.closest(opts.indicatorItemSelector);
        if (indicator) {
          const target = parseInt(indicator.dataset[opts.targetSlideAttr], 10);
          if (!Number.isNaN(target)) showSlide(block, target, 'smooth', opts);
        }
      });
    });
  }

  const prevBtn = block.querySelector(opts.prevSelector);
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const current = parseInt(block.dataset[opts.activeSlideAttr], 10) || 0;
      showSlide(block, current - 1, 'smooth', opts);
    });
  }

  const nextBtn = block.querySelector(opts.nextSelector);
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const current = parseInt(block.dataset[opts.activeSlideAttr], 10) || 0;
      showSlide(block, current + 1, 'smooth', opts);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, entry.target, opts);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll(opts.slideSelector).forEach((slide) => {
    slideObserver.observe(slide);
  });
}

/**
 * Initializes slider behavior on a block: binds controls and observes slides.
 * Call after the block's slides and controls (indicators, prev/next) are in the DOM.
 * @param {Element} block - Root block element
 * @param {Object} options - Optional overrides for selectors/dataset names
 */
export function initSlider(block, options = {}) {
  bindEvents(block, { ...DEFAULT_OPTIONS, ...options });
}
