/*
 * Copyright (C) 2022-2025 AUIOC.ORG
 * Copyright (C) 2018-2022 PCC-Studio
 *
 * This file is part of Wheel of Names.
 *
 * Wheel of Names is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import './index.css';
import { Item, Message, SimpleMessage } from './types';
import { id, recalculateWeights } from './utils';

let wheelWindow: Window = null;
let wheelReady = false;
let wheelLoaded = false;
console.debug('Main page');

function message(type: SimpleMessage): void;
function message(message: Message): void;
function message(o: Message | SimpleMessage) {
    if (typeof o === 'string') {
        o = { type: o };
    }
    if (wheelWindow && !wheelWindow.closed && wheelLoaded) {
        wheelWindow.postMessage(JSON.stringify(o), location.origin);
        wheelWindow.focus();
        return;
    }
    console.warn('wheel not exist or not ready');
}

function openWheelWindow() {
    if (wheelWindow && !wheelWindow.closed) {
    } else {
        wheelLoaded = false;
        wheelWindow = window.open(
            `wheel.html`,
            'Wheel',
            `popup=yes,width=600,height=650`
        );
        if (!wheelWindow) {
            alert('Failed to open wheel window!');
            return;
        }
        wheelWindow.addEventListener('unload', () => {
            if (wheelLoaded) {
                window.postMessage(JSON.stringify({ type: 'unload' }));
            }
        });
    }
    wheelWindow.focus();
}

let _ITEMS_: Item[] = [];
let _TARGET_INDEX_: number = -1;
let lastResult: Item;
const inputTextarea = <HTMLTextAreaElement>id('item-input');
const itemsList = <HTMLTableSectionElement>id('item-list');
const updateBtn = <HTMLButtonElement>id('update-btn');
const spinBtn = <HTMLButtonElement>id('spin-btn');
const removeBtn = <HTMLButtonElement>id('remove-btn');
const resetBtn = <HTMLButtonElement>id('reset-btn');
const cleanBtn = <HTMLButtonElement>id('clean-btn');
spinBtn.disabled = true;
removeBtn.disabled = true;
resetBtn.disabled = true;
cleanBtn.disabled = true;
const statusLabel = id('status');

function updateList(items: Item[]) {
    items = recalculateWeights(items);
    itemsList.innerHTML = '';
    items.forEach((x, i) => {
        const el = document.createElement('tr');
        el.innerHTML = `<td><input type="radio" name="item" value="${i}" id="index${i}"/></td><td data-value="${(x.weight * 100).toFixed(2)}%"></td><td><label for="index${i}">${x.label}</label></td>`;
        itemsList.appendChild(el);
    });
    itemsList.querySelectorAll("input[type='radio']").forEach((el) => {
        const radio = <HTMLInputElement>el;
        radio.addEventListener('change', () => {
            _TARGET_INDEX_ = parseInt(radio.value);
            console.debug('Set target index', _TARGET_INDEX_);
        });
        radio.addEventListener('click', () => {
            if (_TARGET_INDEX_ === parseInt(radio.value)) {
                radio.checked = false;
                _TARGET_INDEX_ = -1;
                console.debug('Clear target index');
            }
        });
    });
}

function updateWheel(items: Item[]) {
    if (wheelWindow && !wheelWindow.closed) {
        const i = setInterval(() => {
            if (wheelLoaded) {
                clearInterval(i);
                message({ type: 'wheel', data: items });
            }
        }, 2);
    }
}

function update(items: Item[]) {
    _ITEMS_ = items;
    _TARGET_INDEX_ = -1;
    updateList(items);
    updateWheel(items);
}

function parseItems() {
    return inputTextarea.value
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .map((x) =>
            x
                .split(',') //
                .reduce(
                    (p, c, i) => ({
                        ...p,
                        ...(((c = c.trim()), c.length > 0)
                            ? i === 0
                                ? { label: c }
                                : {
                                      [i === 1 ? 'weight' : 'uiWeight']:
                                          parseInt(c) ?? undefined,
                                  }
                            : {}),
                    }),
                    <Item>{}
                )
        );
}
updateBtn.addEventListener('click', () => {
    openWheelWindow();
    const parsed = parseItems();
    _ITEMS_ = parsed;
    console.debug('Parsed items', parsed);
    update(parsed);
});

function spin() {
    if (wheelReady) {
        message({
            type: 'spin',
            data: { targetIndex: _TARGET_INDEX_ },
        });
        statusLabel.innerText = 'Spinning...';
        spinBtn.disabled = true;
        removeBtn.disabled = true;
    }
}
spinBtn.addEventListener('click', () => spin());

function reset() {
    statusLabel.innerText = 'Reset...';
    removeBtn.disabled = true;
    resultList.innerHTML = '';
    lastResult = undefined;
    _TARGET_INDEX_ = -1;
    updateList(_ITEMS_);
}

function clean() {
    wheelReady = false;
    _ITEMS_ = [];
    reset();
    statusLabel.innerText = '';
    spinBtn.disabled = true;
    resetBtn.disabled = true;
    removeBtn.disabled = true;
}

resetBtn.addEventListener('click', () => message('reset'));
cleanBtn.addEventListener('click', () => {
    wheelWindow?.close();
    location.reload();
});

const resultList = id('result-list');
function addResult(result: Item) {
    lastResult = result;
    resultList.innerHTML = `<li>${result.label}</li>${resultList.innerHTML}`;
}

function removeLastResult() {
    resultList.children.item(0).classList.add('removed');
    _ITEMS_ = _ITEMS_.filter((x) => x.label !== lastResult.label);
    lastResult = undefined;
    removeBtn.disabled = true;
    update(_ITEMS_);
}
removeBtn.addEventListener('click', () => removeLastResult());

// ========================================================================== //

window.addEventListener('message', function (event) {
    if (event.origin !== this.location.origin) {
        return;
    }
    const msg = JSON.parse(event.data) as Message;
    switch (msg.type) {
        case 'loaded': {
            if (wheelWindow && !wheelWindow.closed) {
                console.debug('Loaded');
                wheelLoaded = true;
                wheelReady = false;
                statusLabel.innerText = 'Not ready yet';
                spinBtn.disabled = true;
                resetBtn.disabled = true;
            }
            break;
        }
        case 'ready': {
            console.debug('Ready');
            wheelReady = true;
            statusLabel.innerText = 'Ready';
            spinBtn.disabled = false;
            resetBtn.disabled = false;
            cleanBtn.disabled = false;
            break;
        }
        case 'unload': {
            console.debug('Unload');
            clean();
            break;
        }
        case 'result': {
            console.info('Result', msg.data.label);
            addResult(msg.data);
            break;
        }
        case 'finished': {
            statusLabel.innerText = 'Finished';
            spinBtn.disabled = false;
            removeBtn.disabled = false;
            break;
        }
        case 'reset': {
            console.debug('Reset');
            reset();
            break;
        }
        default:
            break;
    }
});

/**
 * This field will be automatically replaced to
 * current version text during build.
 * Do not modify it!
 **/
// @ts-expect-error
const version = _version_;

export { version };
