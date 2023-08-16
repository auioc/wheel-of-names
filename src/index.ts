/*
 * Copyright (C) 2022-2023 AUIOC.ORG
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

import { Item, Message } from './types';

let wheelWindow: Window = null;
let wheelReady = false;
console.debug('Main page');

window.addEventListener('message', function (event) {
    if (event.origin !== this.location.origin) {
        return;
    }
    const message = JSON.parse(event.data) as Message;
    switch (message.type) {
        case 'ready': {
            if (wheelWindow && !wheelWindow.closed) {
                console.debug('Ready');
                wheelReady = true;
            }
            break;
        }
        case 'finished': {
            console.info('Result', message.data.label);
            break;
        }
        default:
            break;
    }
});

function message(message: Message) {
    if (wheelWindow && !wheelWindow.closed && wheelReady) {
        wheelWindow.postMessage(JSON.stringify(message), location.origin);
        wheelWindow.focus();
        return;
    }
    console.warn('wheel not exist or not ready');
}

function openWheelWindow() {
    if (wheelWindow && !wheelWindow.closed) {
    } else {
        wheelReady = false;
        wheelWindow = window.open(
            `wheel.html`,
            'Wheel',
            `popup=yes,width=600,height=650`
        );
    }
    wheelWindow.focus();
}

function updateWheel(items: Item[]) {
    if (wheelWindow && !wheelWindow.closed) {
        const i = setInterval(() => {
            if (wheelReady) {
                clearInterval(i);
                message({ type: 'wheel', data: items });
            }
        }, 2);
    }
}

const updateBtn = document.getElementById('update-btn');
const itemsTextarea = document.getElementById('items');
updateBtn.addEventListener('click', () => {
    openWheelWindow();
    const items: Item[] = (<HTMLTextAreaElement>itemsTextarea).value
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
    console.debug('Parsed items', items);
    updateWheel(items);
});
const spinBtn = document.getElementById('spin-btn');
spinBtn.addEventListener('click', () => {
    message({ type: 'spin' });
});
const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', () => {
    message({ type: 'reset' });
});
const cleanBtn = document.getElementById('clean-btn');
cleanBtn.addEventListener('click', () => {
    message({ type: 'clean' });
});
