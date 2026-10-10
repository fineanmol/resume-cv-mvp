import {createContext} from 'react';
import type {LayoutSettings} from '../../types';
/** A section enabling bullets inherits the document style, never a local default. */
export const BulletStyleContext=createContext<NonNullable<LayoutSettings['bulletStyle']>>('disc');
