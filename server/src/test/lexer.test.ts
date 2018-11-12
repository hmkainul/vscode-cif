import * as assert from 'assert';
import { TokenType, lexer } from '../lexer';
import { Range, Position } from 'vscode-languageserver';

describe('lexer', function () {
    it('should recognize tokens', function () {
        let examples: { [key: number]: string } = {
            [TokenType.TAG]: '_atom_site_occupancy',
            [TokenType.COMMENT]: '# This is my comment',
            [TokenType.DATA]: 'data_global',
            [TokenType.LOOP]: 'loop_',
            [TokenType.SAVE_END]: 'save_',
            [TokenType.SAVE]: 'save_foo',
            [TokenType.GLOBAL]: 'global_',
            [TokenType.STOP]: 'stop_',
            [TokenType.SINGLE]: '\'single quoted\'',
            [TokenType.DOUBLE]: '"double quoted"',
            [TokenType.MULTILINE]: '\n;\nmulti\nline\n;',
            [TokenType.NUMBER]: '1.23',
            [TokenType.DOT]: '.',
            [TokenType.QUESTION]: '?',
            [TokenType.UNQUOTED]: 'unquoted',
            [TokenType.WHITESPACE]: '  \t',
            [TokenType.NEWLINE]: '\n'
        };
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
    let sourceCodeWin = sourceCode.replace(/\n/g, '\r\n');
    [sourceCode, sourceCodeWin].forEach(source => {
        let tokens = lexer(source);
        it('should recognize program', function () {
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
                range(0, 0, 0, 4),
                range(0, 4, 0, 5),
                range(0, 5, 0, 10),
                range(0, 10, 4, 1),
                range(4, 1, 5, 0),
                range(5, 0, 6, 0)
            ]
                .forEach((range, index) => assert.deepEqual(tokens[index].range, range));
        });
    });
});

function range(line1: number, character1: number, line2: number, character2: number): Range {
    return Range.create(
        Position.create(line1, character1),
        Position.create(line2, character2)
    );
}
