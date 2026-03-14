/**
 * Shared YouTube and Vimeo embed HTML builders.
 * Used by video and embed blocks. Returns HTML strings for DOMPurify or DOM creation.
 *
 * @param {URL} url - Embed URL
 * @param {boolean} [autoplay=false] - Autoplay when visible
 * @param {boolean} [background=false] - Background/ambient mode (muted, loop, no controls)
 * @returns {string} HTML string for the embed wrapper
 */

const IFRAME_WRAPPER_STYLE = 'left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;';
const IFRAME_STYLE = 'border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;';

export function getYoutubeEmbedHtml(url, autoplay = false, background = false) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const src = vid
    ? `https://www.youtube.com/embed/${vid}?rel=0&v=${vid}${suffix}`
    : `https://www.youtube.com${embed}`;
  return `<div class="iframe-wrapper" style="${IFRAME_WRAPPER_STYLE}">
<iframe src="${src}" style="${IFRAME_STYLE}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
</div>`;
}

export function getVimeoEmbedHtml(url, autoplay = false, background = false) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      background: background ? '1' : '0',
    };
    suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  return `<div class="iframe-wrapper" style="${IFRAME_WRAPPER_STYLE}">
<iframe src="https://player.vimeo.com/video/${video}${suffix}" style="${IFRAME_STYLE}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Content from Vimeo" loading="lazy"></iframe>
</div>`;
}
