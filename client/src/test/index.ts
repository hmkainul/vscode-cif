import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });
    mocha.timeout(100000);
    const testsRoot = __dirname;
    return new Promise((resolve, reject) => {
        glob('**.test.js', { cwd: testsRoot }, (err, files) => {
            if (err) {
                return reject(err);
            }
            files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
            try {
                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    });
}
