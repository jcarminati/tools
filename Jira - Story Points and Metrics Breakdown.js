// ==UserScript==
// @name         Story Points with Metrics Breakdown
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Sum story points and show metrics breakdown
// @author       OpenAI + Julia Carminati
// @match        https://paylocity.atlassian.net/*
// @grant        none
// ==/UserScript==


(function () {
    'use strict';

    const STORAGE_KEY = 'jira-breakdown-toggle';
    const state = {
        seenKeys: new Set(),
        totalPoints: 0,
        issueCount: 0,
        assignees: {},
        investmentCategories: {},
        planStatuses: {},
    };

    const config = {
        columnIdentifiers: {
            storyPoints: '[data-testid="issue-field-story-point-estimate-readview-full.ui.story-point-estimate"] span.css-mnuguu',
            assignee: 'profilecard-next.ui.profilecard.profilecard-trigger',
            investmentCategory: 'Edit Investment Category',
            plannedUnplanned: 'Edit Planned/Unplanned',
        }
    };

function createFooterContent() {
    const footer = document.querySelector('[data-testid="native-issue-table.common.ui.components.footer.footer-container"]');
    if (!footer || document.querySelector('#custom-storypoints-footer')) return;

    const table = document.createElement('table');
    table.id = 'custom-storypoints-footer';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '4px';
    table.style.tableLayout = 'fixed'; // equal column widths

    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');

    // Left cell for story points + investment + planned
    const leftTd = document.createElement('td');
    leftTd.style.verticalAlign = 'top';
    leftTd.style.textAlign = 'left';
    leftTd.style.paddingRight = '20px';

    const storyPointsLine = document.createElement('strong');
    storyPointsLine.id = 'storyPointsLine';
    leftTd.appendChild(storyPointsLine);

    const leftDetails = document.createElement('div');
    leftDetails.id = 'leftDetails';
    leftDetails.style.marginTop = '6px';
    leftTd.appendChild(leftDetails);

    // Center cell for toggle + assignees
    const centerTd = document.createElement('td');
    centerTd.style.verticalAlign = 'top';
    centerTd.style.textAlign = 'left';
    centerTd.style.width = '50%';

    const toggleRow = document.createElement('div');
    toggleRow.style.marginBottom = '4px';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = localStorage.getItem(STORAGE_KEY) === 'true' ? 'Hide Breakdown' : 'Show Breakdown';
    toggleBtn.onclick = () => {
        const current = localStorage.getItem(STORAGE_KEY) === 'true';
        localStorage.setItem(STORAGE_KEY, !current);
        toggleBtn.textContent = !current ? 'Hide Breakdown' : 'Show Breakdown';
        updateFooter();
    };
    toggleRow.appendChild(toggleBtn);
    centerTd.appendChild(toggleRow);

    const centerDetails = document.createElement('div');
    centerDetails.id = 'centerDetails';
    centerTd.appendChild(centerDetails);

    // Add cells to row
    tr.appendChild(leftTd);
    tr.appendChild(centerTd);

    tbody.appendChild(tr);
    table.appendChild(tbody);
    footer.children[0].appendChild(table);
}

function updateFooter() {
    const spText = `📈 ${state.issueCount} issues | ${state.totalPoints} pts`;
    document.getElementById('storyPointsLine').textContent = spText;

    const show = localStorage.getItem(STORAGE_KEY) === 'true';
    const leftDetails = document.getElementById('leftDetails');
    const centerDetails = document.getElementById('centerDetails');
    leftDetails.innerHTML = '';
    centerDetails.innerHTML = '';
    if (!show) return;

    const section = (title, map, fallback = null, container) => {
        const titleEl = document.createElement('div');
        titleEl.innerHTML = `<strong>${title}:</strong>`;
        container.appendChild(titleEl);
        if (fallback && Object.keys(map).length === 0) {
            const row = document.createElement('div');
            row.textContent = fallback;
            row.style.marginLeft = '8px';
            container.appendChild(row);
            return;
        }
        Object.entries(map).forEach(([k, v]) => {
        const percent = Math.round((v.count / state.issueCount) * 100);
        const row = document.createElement('div');
        row.textContent = `${k} - ${v.count} issues | ${v.points} pts (${percent}%)`;
        row.style.marginLeft = '8px';
        container.appendChild(row);
        });
    };

        const spacer = document.createElement('div');
        section('Investment Category', state.investmentCategories, 'Column not displayed', leftDetails);
        spacer.style.height = '10px';
        leftDetails.appendChild(spacer);
        section('Planned/Unplanned', state.planStatuses, 'Column not displayed', leftDetails);
        section('Assignee', state.assignees, 'Column not displayed', centerDetails);
}

    function extractTextFromParent(td) {
        if (!td) return null;
        const div = td.querySelector('div[data-testid]');
        return div?.textContent?.trim() || null;
    }

    function findColumnIndex(labelMatch) {
        const headers = document.querySelectorAll('thead th');
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].textContent.trim().includes(labelMatch)) {
                return i;
            }
        }
        return -1;
    }

    function parseRow(row, storyPointCol, assigneeCol, investmentCol, planCol) {
        const key = row.getAttribute('data-index');
        if (state.seenKeys.has(key)) return;
        state.seenKeys.add(key);

        const tds = row.querySelectorAll('td');

        // Story Points
        const storyTd = tds[storyPointCol];
        const spEl = storyTd?.querySelector(` ${config.columnIdentifiers.storyPoints}`);
        let sp = 0;
        if (spEl) {
            const match = spEl.textContent.trim().match(/^\d+/);
            if (match) {
                sp = parseInt(match[0], 10);
            }
        }
        state.totalPoints += sp;
        state.issueCount++;

        // Assignee
        const assigneeTd = tds[assigneeCol];
        const assigneeText = assigneeTd?.textContent.trim();
        let assignee = assigneeText ? assigneeText.replace(/(.+?)\1+/, '$1') : 'Unassigned';
        if (!state.assignees[assignee]) state.assignees[assignee] = { count: 0, points: 0 };
        state.assignees[assignee].count++;
        state.assignees[assignee].points += sp;

        // Investment Category
        const invTd = tds[investmentCol];
        const invText = extractTextFromParent(invTd);
        if (invText) {
            if (!state.investmentCategories[invText]) state.investmentCategories[invText] = { count: 0, points: 0 };
            state.investmentCategories[invText].count++;
            state.investmentCategories[invText].points += sp;
        }

        // Planned/Unplanned
        const planTd = tds[planCol];
        const planText = extractTextFromParent(planTd);
        if (planText) {
            if (!state.planStatuses[planText]) state.planStatuses[planText] = { count: 0, points: 0 };
            state.planStatuses[planText].count++;
            state.planStatuses[planText].points += sp;
        }

        updateFooter();
    }

    function scanTable() {
        const rows = document.querySelectorAll('[data-testid="native-issue-table.ui.issue-row"]');
        const storyCol = findColumnIndex('Story Points');
        const assigneeCol = findColumnIndex('Assignee');
        const investmentCol = findColumnIndex('Investment Category');
        const planCol = findColumnIndex('Planned/Unplanned');

        if (storyCol < 0) return;

        rows.forEach(row => parseRow(row, storyCol, assigneeCol, investmentCol, planCol));
    }

    function observe() {
        const container = document.querySelector('[data-testid="native-issue-table.ui.scroll-container.scroll-container"]');
        if (!container) return;

        const observer = new MutationObserver(() => {
            scanTable();
        });
        observer.observe(container, { childList: true, subtree: true });
    }

    function init() {
        createFooterContent();
        scanTable();
        observe();
    }

    const interval = setInterval(() => {
        const check = document.querySelector('[data-testid="native-issue-table.ui.scroll-container.scroll-container"]');
        if (check) {
            clearInterval(interval);
            init();
        }
    }, 1000);
})();
