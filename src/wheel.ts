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

import { Item, Message, SimpleMessage, SpinOptions } from './types';
import { div, recalculateWeights } from './utils';
import './wheel.css';

console.debug('Wheel page');

let ready = false;

let items: Item[] = [];

const body = document.body;
const wheelBox = div('wheel-container');
const wheel = div('wheel', 'wheel');
const pointer = div('pointer');
const wheelLabel = div('wheel-label');
const spinBtn = div('wheel-center flex-c');
const resultPopup = div('result-popup flex-c');
const resultLabel = div('result-label flex-c');

let prevRotate = 0;
let prevRotateOffset = 0;
let animation: Animation;

function message(type: SimpleMessage): void;
function message(message: Message): void;
function message(o: Message | SimpleMessage) {
    if (typeof o === 'string') {
        o = { type: o };
    }
    window.opener?.postMessage(JSON.stringify(o), location.origin);
}

function resetPopup() {
    resultPopup.style.visibility = 'hidden';
    resultPopup.style.opacity = '0';
    resultLabel.innerHTML = '';
}

function popupResult(result: Item) {
    resultPopup.style.visibility = 'unset';
    resultPopup.style.opacity = '1';
    resultLabel.innerHTML = `<p>${result.label}</p>`;
}

function reset() {
    ready = false;
    prevRotate = 0;
    prevRotateOffset = 0;
    if (animation) {
        animation.cancel();
    }
    resetPopup();
    ready = true;
}

function clean() {
    items = [];
    wheelBox.style.display = 'none';

    wheelLabel.innerHTML = '';
    wheel.style.background = '#ffffff33';
    reset();
    ready = false;
}

function update(_items: Item[]) {
    clean();

    items = recalculateWeights(_items);
    console.debug('Update', items);

    if (items.length === 0) {
        wheel.style.background = '#ffffff33';
        console.warn('no items');
        ready = false;
        message('clean');
        return;
    }

    let rotate = 0;
    let gradients: string[] = [];
    let labels: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const { label, uiWeight } = items[i];

        const angle = uiWeight * 360;
        const nextRotate = rotate + angle;

        const hue = `${(360 * (i + 1)) / items.length}`;
        gradients.push(`hsl(${hue},100%,75%) ${rotate}deg ${nextRotate}deg`);

        const labelRotate = rotate + angle / 2;
        labels.push(
            `<div style="transform: rotate(${labelRotate}deg);"><div >${label}</div></div>`
        );

        rotate = nextRotate;
    }

    wheel.style.background =
        'conic-gradient(from 0deg,' + gradients.join(',') + ')';
    wheelLabel.innerHTML = labels.join('');

    wheelBox.style.display = 'unset';

    ready = true;
    message('ready');
}

function spin(options: SpinOptions = {}) {
    let { targetIndex = undefined } = options;
    const {
        duration = 4000,
        stopPosition = 'random',
        additionTurns = 5,
    } = options;

    if (animation) {
        animation.cancel();
    }
    resetPopup();

    if (items.length === 0) {
        console.warn('no items');
        return;
    }

    const random = Math.random();

    if (
        targetIndex === undefined ||
        targetIndex < 0 ||
        targetIndex > items.length - 1
    ) {
        targetIndex = 0;
        let w = 0;
        for (let i = 0; i < items.length; i++) {
            w += items[i].weight;
            if (random <= w) {
                targetIndex = i;
                break;
            }
        }
    }
    const targetItem = items[targetIndex];

    console.log('Result', targetItem.label);
    message({ type: 'result', data: targetItem });

    let rotateOffset = 0;
    for (let i = 0; i < targetIndex; i++) {
        rotateOffset += items[i].uiWeight * 360;
    }
    rotateOffset = 360 - rotateOffset;

    switch (stopPosition) {
        case 'center': {
            rotateOffset -= (targetItem.uiWeight * 360) / 2;
            break;
        }
        case 'random': {
            rotateOffset -= targetItem.uiWeight * 360 * Math.random();
            break;
        }
        case 'zero': {
            break;
        }
    }

    const targetRotate =
        prevRotate +
        -prevRotateOffset + // 修正回0度位置
        additionTurns * 360 + // 加整圈数
        rotateOffset; // 目标位置

    animation = wheel.animate(
        [
            { transform: `rotate(${prevRotate}deg)` },
            { transform: `rotate(${targetRotate}deg)` },
        ],
        {
            duration: duration,
            direction: 'normal',
            easing: 'cubic-bezier(0.440, -0.205, 0.000, 1.130)',
            fill: 'forwards',
            iterations: 1,
        }
    );

    prevRotate = targetRotate;
    prevRotateOffset = rotateOffset;

    animation.onfinish = (_ev) => {
        message({ type: 'finished', data: targetItem });
        popupResult(targetItem);
    };
}

document.addEventListener('DOMContentLoaded', function () {
    body.append(wheelBox, resultPopup);
    body.classList.add('flex-c');
    resultPopup.append(resultLabel);
    resetPopup();
    wheelBox.append(pointer, spinBtn, wheel);
    wheelBox.style.display = 'none';
    wheel.append(wheelLabel);
    clean();
    message('loaded');
});

window.addEventListener('message', function (event) {
    if (event.origin !== this.location.origin) {
        return;
    }
    const msg = JSON.parse(event.data) as Message;
    console.debug('Message', event.data);
    switch (msg.type) {
        case 'wheel': {
            console.debug('Update', JSON.parse(JSON.stringify(msg.data)));
            update(msg.data);
            break;
        }
        case 'reset': {
            console.debug('Reset');
            reset();
            message('ready');
            break;
        }
        case 'clean': {
            console.debug('Clean');
            clean();
            message('clean');
            break;
        }
        case 'spin': {
            if (!ready) {
                console.warn('not ready');
                break;
            }
            console.debug('Spin');
            spin(msg?.data);
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

export { clean, reset, spin, update, version };
