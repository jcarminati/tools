// ==UserScript==
// @name         Jira - Total Story Points
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Track Story Points with reset on search/filter change
// @match        https://paylocity.atlassian.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const footerSelector = '[data-testid="native-issue-table.common.ui.components.footer.footer-container"]';
    const tableContainerSelector = '[data-testid="native-issue-table.ui.scroll-container.scroll-container"]';

    let seenKeys = new Set();
    let cumulativeSum = 0;
    let cumulativeCount = 0;

    function resetTotals() {
        seenKeys = new Set();
        cumulativeSum = 0;
        cumulativeCount = 0;

        const footer = document.querySelector(footerSelector);
        const centerSlot = footer?.querySelectorAll('div._16jlkb7n')[1];
        const summary = centerSlot?.querySelector('.tampermonkey-story-point-sum');
        if (summary) {
            summary.textContent = '';
        }
    }

    function updateFooterDisplay() {
        const footer = document.querySelector(footerSelector);
        const centerSlot = footer?.querySelectorAll('div._16jlkb7n')[1];
        if (!centerSlot) return;

        let summary = centerSlot.querySelector('.tampermonkey-story-point-sum');
        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'tampermonkey-story-point-sum';
            summary.style.textAlign = 'center';
            summary.style.fontWeight = 'bold';
            summary.style.fontSize = '14px';
            centerSlot.appendChild(summary);
        }

        summary.textContent = `Story Points (Total): ${cumulativeSum} (from ${cumulativeCount} issues)`;
    }

    function scanNewRows() {
        const rows = document.querySelectorAll('tr[data-index]');
        rows.forEach(row => {
            const key = row.getAttribute('data-index');
            if (!key || seenKeys.has(key)) return;

            const pointSpan = row.querySelector('span.css-mnuguu');
            if (!pointSpan) return;

            const val = parseFloat(pointSpan.textContent.trim());
            if (!isNaN(val)) {
                seenKeys.add(key);
                cumulativeSum += val;
                cumulativeCount += 1;
            }
        });

        updateFooterDisplay();
    }

    const readyInterval = setInterval(() => {
        const container = document.querySelector(tableContainerSelector);
        const footer = document.querySelector(footerSelector);

        if (container && footer) {
            clearInterval(readyInterval);

            scanNewRows(); // Initial scan

            // Watch for changes in scroll container (new rows)
            const rowObserver = new MutationObserver(() => {
                scanNewRows();
            });

            rowObserver.observe(container, {
                childList: true,
                subtree: true,
            });

            // Watch for full table refresh (filter/search changes)
            const refreshObserver = new MutationObserver(() => {
                resetTotals(); // Clear all seen keys and totals
                scanNewRows(); // Recalculate from new data
            });

            const tableRoot = container.parentElement; // Outer wrapper that changes on search
            if (tableRoot) {
                refreshObserver.observe(tableRoot, {
                    childList: true,
                    subtree: false,
                });
            }
        }
    }, 500);
})();
