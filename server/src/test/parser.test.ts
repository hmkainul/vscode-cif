import * as assert from 'assert';
import { TokenType, lexer } from '../lexer';
import { parser } from '../parser';

let code = 
`data_foo
loop_
_aaa
_bbb
a1 b1
a2 b2
`

describe('parser', function () {
    it('should connect tag and value', function () {
        let tokens = lexer(code);
        parser(tokens);
        tokens = tokens
            .filter(t => t.type !== TokenType.COMMENT
                && t.type < TokenType.WHITESPACE);
        assert.equal(tokens.length, 8);
        let a1 = tokens[4];
        assert.equal(a1.tag.text, "_aaa");
    });
});
