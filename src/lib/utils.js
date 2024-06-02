import { Capacitor } from '@capacitor/core';
export const platforms = {
	web: 0,
	mobile: 1,
	desktop: 2
};
export function getPlatform() {
	if (!window) return;

	if (/**@type {any}*/ (window)?.__TAURI__ !== undefined) return platforms.web;

	if (Capacitor.getPlatform() === 'web') return platforms.web;

	return platforms.mobile;
}
