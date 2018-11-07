import * as assert from 'assert';
import { TokenType, lexer } from '../lexer';

interface TokenTypeToExample {
    [key: number]: string;
}

describe('lexer', function () {
    it('should recognize tokens', function () {
        let examples: TokenTypeToExample = {};
        examples[TokenType.TAG] = '_atom_site_occupancy';
        examples[TokenType.COMMENT] = '# This is my comment';
        examples[TokenType.DATA] = 'data_global';
        examples[TokenType.LOOP] = 'loop_';
        examples[TokenType.SAVE_END] = 'save_';
        examples[TokenType.SAVE] = 'save_foo';
        examples[TokenType.GLOBAL] = 'global_';
        examples[TokenType.STOP] = 'stop_';
        examples[TokenType.SINGLE] = '\'single quoted\'';
        examples[TokenType.DOUBLE] = '"double quoted"';
        examples[TokenType.MULTILINE] = '\n;\nmulti\nline\n;';
        examples[TokenType.NUMBER] = '1.23';
        examples[TokenType.DOT] = '.';
        examples[TokenType.QUESTION] = '?';
        examples[TokenType.UNQUOTED] = 'unquoted';
        examples[TokenType.WHITESPACE] = '  \t';
        examples[TokenType.NEWLINE] = '\n';
        for (let tokenType in examples) {
            let tokens = lexer(examples[tokenType]);
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, tokenType);
        }
    });
});
