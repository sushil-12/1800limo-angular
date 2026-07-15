#!/usr/bin/env node
'use strict';

/**
 * Generates a static /llms.txt file (https://llmstxt.org convention) listing
 * every fleet vehicle and its starting hourly/mileage rate, fetched live from
 * the vehicle-types-formatted API. Written directly into the build output so
 * it's served as a plain static file - no JS execution required to read it.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.LLMS_API_URL || 'https://api.1800limo.com/api/vehicle-types-formatted';
const SITE_URL = process.env.LLMS_SITE_URL || 'https://www.1800limo.com';
const OUTPUT_PATH = process.env.LLMS_OUTPUT_PATH || path.join(__dirname, '..', 'dist', 'limo1800', 'llms.txt');

function fetchJson(urlStr) {
	return new Promise((resolve, reject) => {
		const client = urlStr.startsWith('https') ? https : http;
		client.get(urlStr, (res) => {
			if (res.statusCode < 200 || res.statusCode >= 300) {
				res.resume();
				reject(new Error(`Request to ${urlStr} failed with status ${res.statusCode}`));
				return;
			}
			let body = '';
			res.on('data', (chunk) => { body += chunk; });
			res.on('end', () => {
				try {
					resolve(JSON.parse(body));
				} catch (err) {
					reject(new Error(`Failed to parse JSON from ${urlStr}: ${err.message}`));
				}
			});
		}).on('error', reject);
	});
}

function formatRate(value) {
	if (value === null || value === undefined || value === '') return null;
	const num = Number(value);
	return Number.isFinite(num) ? num.toFixed(2) : String(value);
}

function vehicleLine(vehicle) {
	const specs = vehicle.specifications || {};
	const price = vehicle.price || {};
	const parts = [`- **${vehicle.name}**`];

	if (vehicle.category) parts.push(`(${vehicle.category})`);

	const specBits = [];
	if (specs.passengers) specBits.push(`seats ${specs.passengers}`);
	if (specs.luggage) specBits.push(`${specs.luggage} luggage`);
	if (specBits.length) parts.push(`— ${specBits.join(', ')}`);

	const rateBits = [];
	const hourly = formatRate(price.hourly_rate);
	const mileage = formatRate(price.milage_rate);
	if (hourly) rateBits.push(`$${hourly}/hour`);
	if (mileage) rateBits.push(`$${mileage}/mile`);
	if (rateBits.length) parts.push(`— ${rateBits.join(', ')} starting rate`);

	let line = parts.join(' ');
	if (Array.isArray(vehicle.features) && vehicle.features.length) {
		line += `. Features: ${vehicle.features.join(', ')}.`;
	}
	return line;
}

async function main() {
	const response = await fetchJson(API_URL);
	if (!response || response.success === false) {
		throw new Error('vehicle-types-formatted API did not return a successful response');
	}

	const vehicles = (response.data && response.data.vehicles) || [];
	if (!vehicles.length) {
		throw new Error('No vehicles returned from vehicle-types-formatted - refusing to write an empty llms.txt');
	}

	const generatedAt = new Date().toISOString().slice(0, 10);
	const lines = [];

	lines.push('# 1800 Limo');
	lines.push('');
	lines.push('> Licensed, insured chauffeured transportation - sedans, SUVs, limousines, vans/sprinters, and buses for airport transfers, corporate travel, events, and group charters, available 24/7.');
	lines.push('');
	lines.push(`1800 Limo operates a fleet of ${vehicles.length} vehicle classes. Each entry below lists its starting hourly rate and per-mile rate, fetched directly from our live rates system. These are base/starting rates - for an exact price on a specific trip (date, pickup/dropoff, passenger count), use the rate calculator at ${SITE_URL}/fleet or request a quote at ${SITE_URL}/home.`);
	lines.push('');
	lines.push('## Fleet & Rates');
	lines.push('');
	vehicles.forEach((vehicle) => lines.push(vehicleLine(vehicle)));
	lines.push('');
	lines.push('## Key Pages');
	lines.push('');
	lines.push(`- [Fleet & Rates](${SITE_URL}/fleet): Full vehicle list with live starting rates and an instant rate calculator.`);
	lines.push(`- [Request a Quote](${SITE_URL}/home): Book a specific trip and get an exact, bookable price.`);
	lines.push('');
	lines.push('## Notes');
	lines.push('');
	lines.push('- Rates shown are starting/base rates per vehicle class and can vary by market, date, minimum-hour requirements, tolls, and gratuity.');
	lines.push(`- This file is regenerated automatically at build time from live fleet data. Last generated: ${generatedAt}.`);
	lines.push('');

	const content = lines.join('\n');
	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, content, 'utf8');
	console.log(`llms.txt written to ${OUTPUT_PATH} (${vehicles.length} vehicles)`);
}

main().catch((err) => {
	console.error('Failed to generate llms.txt:', err.message);
	process.exit(1);
});
