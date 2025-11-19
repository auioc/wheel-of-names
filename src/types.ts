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

export interface Item {
    label: string;
    weight?: number;
    uiWeight?: number;
}

export type Message =
    | { type: 'ready' }
    | { type: 'wheel'; data: Item[] }
    | { type: 'spin'; data?: SpinOptions }
    | { type: 'reset' }
    | { type: 'clean' }
    | { type: 'result'; data: Item }
    | { type: 'finished'; data: Item };

export interface SpinOptions {
    targetIndex?: number;
    duration?: number;
    stopPosition?: 'zero' | 'center' | 'random';
    additionTurns?: number;
}
