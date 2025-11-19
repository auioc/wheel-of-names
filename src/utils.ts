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

import { Item } from './types';

export function div(
    clazz?: string | string[],
    id?: string,
    fn?: (el: HTMLDivElement) => void
) {
    const el = document.createElement('div');
    if (clazz) {
        el.classList.add(...(Array.isArray(clazz) ? clazz : clazz.split(' ')));
    }
    if (id && ((id = id.trim()), id.length > 0)) {
        el.id = id;
    }
    if (fn) {
        fn(el);
    }
    return el;
}

export function recalculateWeights(items: Item[]) {
    let W = 0;
    let uiW = 0;
    const r: Item[] = [];
    for (const item of items) {
        if (item.label) {
            item.weight = item.weight ?? 1;
            item.uiWeight = item.uiWeight ?? item.weight;
            W += item.weight;
            uiW += item.uiWeight;
            r.push(item);
        }
    }
    for (const item of r) {
        item.weight = item.weight / W;
        item.uiWeight = item.uiWeight / uiW;
    }
    return r;
}
