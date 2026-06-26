import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-states-test',
	templateUrl: './states-test.component.html',
	styleUrls: ['./states-test.component.scss']
})
export class StatesTestComponent implements OnInit {

	readonly apiUrl =
		'http://10.20.10.120:8080/api/v1/states?apiKey=7NJ9OgxY9GzSWq47VtaNJg==:gDzCr4kiCgB7Br5h3auDmw==';

	loading = false;
	error: string | null = null;

	/** Raw response, for the JSON fallback view. */
	raw: any = null;
	/** Normalised list of rows to render in the table. */
	rows: any[] = [];
	/** Column keys derived from the rows. */
	columns: string[] = [];

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		this.fetch();
	}

	fetch(): void {
		this.loading = true;
		this.error = null;
		this.raw = null;
		this.rows = [];
		this.columns = [];

		this.http.get<any>(this.apiUrl).subscribe({
			next: (res) => {
				this.raw = res;
				this.rows = this.extractRows(res);
				this.columns = this.deriveColumns(this.rows);
				this.loading = false;
			},
			error: (err) => {
				this.error =
					err?.message || 'Failed to load states. Check that the API is reachable.';
				this.loading = false;
			}
		});
	}

	/** Pull an array of records out of common response shapes. */
	private extractRows(res: any): any[] {
		if (Array.isArray(res)) {
			return res;
		}
		if (res && typeof res === 'object') {
			for (const key of ['data', 'states', 'results', 'items']) {
				if (Array.isArray(res[key])) {
					return res[key];
				}
			}
			// Single object → render as one row.
			return [res];
		}
		return [];
	}

	/** Collect every primitive column key seen across the rows. */
	private deriveColumns(rows: any[]): string[] {
		const cols: string[] = [];
		for (const row of rows) {
			if (row && typeof row === 'object' && !Array.isArray(row)) {
				for (const key of Object.keys(row)) {
					if (!cols.includes(key)) {
						cols.push(key);
					}
				}
			}
		}
		return cols;
	}

	cell(row: any, col: string): string {
		const value = row?.[col];
		if (value === null || value === undefined) {
			return '';
		}
		return typeof value === 'object' ? JSON.stringify(value) : String(value);
	}

	get rawJson(): string {
		return JSON.stringify(this.raw, null, 2);
	}
}
