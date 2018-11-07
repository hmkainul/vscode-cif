import * as assert from 'assert';
import { parser } from '../parser';

let sourceCode = 
`data_foo
loop_
_aaa
_bbb
a1 b1
a2 b2
`

describe('parser', function () {
    it('should connect tag and value', function () {
        let tokens = parser(sourceCode);
        assert.equal(tokens.length, 8);
        let a1 = tokens[4];
        assert.equal(a1.tag.text, "_aaa");
    });
});
