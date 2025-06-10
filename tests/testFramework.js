class TestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    describe(description, testFn) {
        console.log(`\n${description}`);
        testFn();
    }

    it(description, testFn) {
        try {
            testFn();
            console.log(`  ✓ ${description}`);
            this.results.push({description, passed: true});
        } catch (error) {
            console.error(`  ✗ ${description}`);
            console.error(`    ${error.message}`);
            this.results.push({description, passed: false, error});
        }
    }

    expect(actual) {
        return {
            toBe(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toBeCloseTo(expected, precision = 2) {
                const diff = Math.abs(actual - expected);
                if (diff > Math.pow(10, -precision)) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toBeTruthy() {
                if (!actual) {
                    throw new Error(`Expected truthy but got ${actual}`);
                }
            },
            toContain(item) {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array to contain ${item}`);
                }
            },
            toBeGreaterThan(expected) {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeLessThan(expected) {
                if (actual >= expected) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            }
        };
    }

    summary() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        console.log(`\nTests: ${passed}/${total} passed`);
        return passed === total;
    }
}