/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable sonarjs/cognitive-complexity */
import { resyncTabsBlock } from '../../blocks/tabs/tabs.js';
import { showSlide } from '../../scripts/slider.js';
import { moveInstrumentation } from './ue-utils.js';

const setupObservers = () => {
  const mutatingBlocks = document.querySelectorAll('div.cards, div.carousel, div.accordion, div.tabs');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.target.tagName === 'DIV') {
        const addedElements = mutation.addedNodes;
        const removedElements = mutation.removedNodes;

        // detect the mutation type of the block or picture (for cards)
        const type = mutation.target.classList.contains('cards-card-image') ? 'cards-image' : mutation.target.attributes['data-aue-model']?.value;

        switch (type) {
          case 'cards':
            // handle card div > li replacements
            if (addedElements.length === 1 && addedElements[0].tagName === 'UL') {
              const ulEl = addedElements[0];
              const removedDivEl = [...mutation.removedNodes].filter((node) => node.tagName === 'DIV');
              removedDivEl.forEach((div, index) => {
                if (index < ulEl.children.length) {
                  moveInstrumentation(div, ulEl.children[index]);
                }
              });
            }
            break;
          case 'cards-image':
            // handle card-image picture replacements
            if (mutation.target.classList.contains('cards-card-image')) {
              const addedPictureEl = [...mutation.addedNodes].filter((node) => node.tagName === 'PICTURE');
              const removedPictureEl = [...mutation.removedNodes].filter((node) => node.tagName === 'PICTURE');
              if (addedPictureEl.length === 1 && removedPictureEl.length === 1) {
                const oldImgEL = removedPictureEl[0].querySelector('img');
                const newImgEl = addedPictureEl[0].querySelector('img');
                if (oldImgEL && newImgEl) {
                  moveInstrumentation(oldImgEL, newImgEl);
                }
              }
            }
            break;
          case 'accordion':
            if (addedElements.length === 1 && addedElements[0].matches('li.accordion-item')) {
              const removed = removedElements[0];
              const added = addedElements[0];
              moveInstrumentation(removed, added);
              const addedLabel = added.querySelector('.accordion-item-label');
              const addedBody = added.querySelector('.accordion-item-body');
              if (removed.children[0] && addedLabel) moveInstrumentation(removed.children[0], addedLabel);
              if (removed.children[1] && addedBody) moveInstrumentation(removed.children[1], addedBody);
            }
            break;
          case 'carousel':
            if (removedElements.length === 1 && removedElements[0].attributes['data-aue-model']?.value === 'carousel-item') {
              const resourceAttr = removedElements[0].getAttribute('data-aue-resource');
              if (resourceAttr) {
                const itemMatch = resourceAttr.match(/item-(\d+)/);
                if (itemMatch && itemMatch[1]) {
                  const slideIndex = parseInt(itemMatch[1], 10);
                  const slides = mutation.target.querySelectorAll('li.carousel-slide');
                  const targetSlide = Array.from(slides).find((slide) => parseInt(slide.getAttribute('data-slide-index'), 10) === slideIndex);
                  if (targetSlide) {
                    moveInstrumentation(removedElements[0], targetSlide);
                  }
                }
              }
            }
            break;
          case 'tabs': {
            const tablistEl = mutation.target.querySelector(':scope > .tabs-list');
            const rowMutated = [...addedElements].some(
              (n) => n.nodeType === Node.ELEMENT_NODE && n.parentElement === mutation.target && n !== tablistEl,
            ) || [...removedElements].some(
              (n) => n.nodeType === Node.ELEMENT_NODE && tablistEl && !tablistEl.contains(n),
            );
            if (rowMutated) {
              resyncTabsBlock(mutation.target);
            }

            if (removedElements.length === 1 && removedElements[0].attributes['data-aue-model']?.value === 'tabs-item') {
              const resourceAttr = removedElements[0].getAttribute('data-aue-resource');
              if (resourceAttr) {
                const itemMatch = resourceAttr.match(/item-(\d+)/);
                if (itemMatch && itemMatch[1]) {
                  const tabIndex = parseInt(itemMatch[1], 10);
                  const panels = mutation.target.querySelectorAll(':scope > .tabs-panel[role="tabpanel"]');
                  const targetPanel = Array.from(panels).find((panel) => parseInt(panel.getAttribute('data-tab-index'), 10) === tabIndex);
                  if (targetPanel) {
                    moveInstrumentation(removedElements[0], targetPanel);
                    const removed = removedElements[0];
                    const addedName = targetPanel.querySelector(':scope > div:nth-child(1)');
                    const addedContent = targetPanel.querySelector(':scope > div:nth-child(2)');
                    const removedName = removed.querySelector(':scope > div:nth-child(1)');
                    const removedContent = removed.querySelector(':scope > div:nth-child(2)');
                    if (removedName && addedName) moveInstrumentation(removedName, addedName);
                    if (removedContent && addedContent) moveInstrumentation(removedContent, addedContent);
                  }
                }
              }
            } else if (addedElements.length === 1 && addedElements[0].matches('div.tabs-panel[role="tabpanel"]')) {
              const removed = removedElements[0];
              const added = addedElements[0];
              if (removed && removed.nodeType === 1) {
                moveInstrumentation(removed, added);
                const addedName = added.querySelector(':scope > div:nth-child(1)');
                const addedContent = added.querySelector(':scope > div:nth-child(2)');
                const removedName = removed.querySelector(':scope > div:nth-child(1)');
                const removedContent = removed.querySelector(':scope > div:nth-child(2)');
                if (removedName && addedName) moveInstrumentation(removedName, addedName);
                if (removedContent && addedContent) moveInstrumentation(removedContent, addedContent);
              }
            }
            break;
          }
          default:
            break;
        }
      }
    });
  });

  mutatingBlocks.forEach((cardsBlock) => {
    observer.observe(cardsBlock, { childList: true, subtree: true });
  });
};

const setupUEEventHandlers = () => {
  document.addEventListener('aue:ui-select', (event) => {
    const { detail } = event;
    const resource = detail?.resource;

    if (resource) {
      const element = document.querySelector(`[data-aue-resource="${resource}"]`);
      if (!element) {
        return;
      }
      const blockEl = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
      if (blockEl) {
        const block = blockEl.getAttribute('data-aue-model');
        const index = element.getAttribute('data-slide-index');

        switch (block) {
          case 'accordion':
            blockEl.querySelectorAll('details').forEach((details) => {
              details.open = false;
            });
            element.open = true;
            break;
          case 'carousel':
            if (index) {
              showSlide(blockEl, index);
            }
            break;
          case 'tabs':
            if (element === blockEl) {
              return;
            }
            {
              const panel = element.closest('.tabs-panel[role="tabpanel"]');
              if (!panel) {
                break;
              }
              blockEl.querySelectorAll('[role=tabpanel]').forEach((p) => {
                p.setAttribute('aria-hidden', true);
              });
              panel.setAttribute('aria-hidden', false);
              blockEl.querySelector('.tabs-list').querySelectorAll('button').forEach((btn) => {
                btn.setAttribute('aria-selected', false);
              });
              const tabBtn = blockEl.querySelector(`[aria-controls="${panel.id}"]`);
              if (tabBtn) {
                tabBtn.setAttribute('aria-selected', true);
              }
            }
            break;
          default:
            break;
        }
      }
    }
  });
};

export default () => {
  setupObservers();
  setupUEEventHandlers();
};
