// import toggleScheduler from '../scheduler/scheduler.js';
import initQuickEdit from '../quick-edit/quick-edit.js';

export default async function init(sk) {
  // Handle button clicks
  // sk.addEventListener('custom:scheduler', toggleScheduler);
  sk.addEventListener('custom:quick-edit', initQuickEdit);

  // Show after all decoration is finished
  sk.classList.add('is-ready');
}

/* eslint-disable import/no-cycle */
/* from da-block-collection, not sure we need this
import { NX_ORIGIN } from '../../scripts/scripts.js';

let expMod;
const DA_EXP = '/public/plugins/exp/exp.js';

async function toggleExp() {
  const exists = document.querySelector('#aem-sidekick-exp');

  // If it doesn't exist, let module side effects run
  if (!exists) {
    expMod = await import(`${NX_ORIGIN}${DA_EXP}`);
    return;
  }

  // Else, cache the module here and toggle it.
  if (!expMod) expMod = await import(`${NX_ORIGIN}${DA_EXP}`);
  expMod.default();
}

(async function sidekick() {
  const sk = document.querySelector('aem-sidekick');
  if (!sk) return;
  sk.addEventListener('custom:experimentation', toggleExp);
}());
*/
