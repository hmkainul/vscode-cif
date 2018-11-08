import * as assert from 'assert';
import { TokenType, lexer } from '../lexer';
import { Range } from 'vscode-languageserver';

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
    let sourceCode =
        `_key value
;
multi
line
;
# comment
`;
    let tokens = lexer(sourceCode);
    it('should recognize program', function () {
        let tokens = lexer(sourceCode);
        assert.deepEqual(tokens.map(t => t.type),
            [TokenType.TAG,
            TokenType.WHITESPACE,
            TokenType.UNQUOTED,
            TokenType.MULTILINE,
            TokenType.NEWLINE,
            TokenType.COMMENT]);
    });
    it('should recognize positions', function () {
        [
            range(0, 0, 0, 3),
            range(0, 4, 0, 4),
            range(0, 5, 0, 9),
            range(0, 10, 4, 0),
            range(4, 1, 4, 1),
            range(5, 0, 5, 9)
        ]
            .forEach((range, index) => assert.deepEqual(tokens[index].range, range));
    });
});

function range(line1: number, character1: number, line2: number, character2: number): Range {
    return {
        start: { line: line1, character: character1 },
        end: { line: line2, character: character2 }
    };
}
