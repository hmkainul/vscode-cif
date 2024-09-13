import * as assert from 'assert';
import { parser } from '../parser';

const sourceCode =
    `data_foo
loop_
_aaa
_bbb
a1 b1
a2 b2
`

describe('parser', function () {
    it('should connect tag and value', function () {
        const tokens = parser(sourceCode);
        assert.equal(tokens.length, 8);
        const a1 = tokens[4];
        const b2 = tokens[7];
        [a1, b2].forEach(token => {
            assert.equal(token.block.text, "data_foo");
            assert.equal(token.loop.text, "loop_");
        });
        assert.equal(a1.tag.text, "_aaa");
        assert.equal(b2.tag.text, "_bbb");
    });
});
