import type { Buffer } from 'buffer';
import type { Rule } from './machine';
import { Machine } from './machine';
import type { Writable } from 'stream';

const epsilon = 0.00001;

export default class TextMachine extends Machine {
    output: Writable;
    snippets: [number, number, Buffer][];

    constructor(o: Writable) {
        super();
        this.output = o;
        this.snippets = [];
    }

    putRule(_rule: Rule) {
        /* ignore */
    }

    beginPage(page: unknown) {
        super.beginPage(page);
        this.snippets = [];
    }

    endPage() {
        this.snippets = this.snippets.sort(function (a, b) {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;

            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;

            return 0;
        });

        if (this.snippets.length == 0) return;

        let previousH = this.snippets[0][0];
        let previousV = this.snippets[0][1];

        for (const snippet of this.snippets) {
            const h = snippet[0];
            const v = snippet[1];

            if (v > previousV) this.output.write('\n');

            if (h > previousH + epsilon) this.output.write(' ');

            this.output.write(snippet[2].toString());

            previousV = v;
            previousH = h;
        }
    }

    putText(text: Buffer): number {
        this.snippets.push([this.position.h, this.position.v, text]);
        return epsilon;
    }

    postPost(_p: unknown) {
        this.output.end();
    }
}
