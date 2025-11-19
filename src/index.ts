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

import { Item, Message } from './types';
import { id } from './utils';

let wheelWindow: Window = null;
let wheelReady = false;
console.debug('Main page');

type SimpleMessage = Exclude<Message, { data: any }>;
function message(type: SimpleMessage['type']): void;
function message(message: Message): void;
function message(o: Message | SimpleMessage['type']) {
    if (typeof o === 'string') {
        o = { type: o };
    }
    if (wheelWindow && !wheelWindow.closed && wheelReady) {
        wheelWindow.postMessage(JSON.stringify(o), location.origin);
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

const itemsTextarea = id('items');
id('update-btn').addEventListener('click', () => {
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
id('spin-btn').addEventListener('click', () => message('spin'));
id('reset-btn').addEventListener('click', () => message('reset'));
id('clean-btn').addEventListener('click', () => message('clean'));

const resultList = id('result-list');
function addResult(result: Item) {
    resultList.innerHTML = `<li>${result.label}</li>${resultList.innerHTML}`;
}

// ========================================================================== //

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
        case 'result': {
            console.info('Result', message.data.label);
            addResult(message.data);
            break;
        }
        default:
            break;
    }
});
