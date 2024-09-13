import { Token, TokenType, lexer } from './lexer';

interface Data {
    tokens: Token[];
    index: number;
    block?: Token;
    loop?: Token;
}

export function parser(sourceCode: string): Token[] {
    let tokens = lexer(sourceCode);
    tokens = tokens
        .filter(t => t.type !== TokenType.COMMENT
            && t.type < TokenType.WHITESPACE);
    const data = {
        tokens,
        index: 0
    }
    while (dataBlock(data)) {
        // ...
    }
    return tokens;
}

function dataBlock(data: Data): boolean {
    const block = next(data);
    if (is(block, TokenType.DATA)) {
        data.block = block;
        while (dataItems(data) || saveFrame(data)) {
            // ...
        }
        data.block = null;
        return true;
    }
    return false;
}

function dataItems(data: Data): boolean {
    if (tagAndValue(data)) {
        return true;
    } else if (loop(data)) {
        data.loop = null;
        return true;
    } else {
        return false;
    }
}

function saveFrame(data: Data): boolean {
    const previousIndex = data.index;
    const begin = next(data);
    if (is(begin, TokenType.SAVE)) {
        if (dataItems(data)) {
            while (dataItems(data)) {
                // ...
            }
            const end = next(data);
            if (is(end, TokenType.SAVE_END)) {
                return true;
            }
        }
    }
    data.index = previousIndex;
    return false;
}

function tagAndValue(data: Data): boolean {
    const previousIndex = data.index;
    const tag = next(data);
    if (is(tag, TokenType.TAG)) {
        const value = next(data);
        if (isValue(value)) {
            value.tag = tag;
            return true;
        }
    }
    data.index = previousIndex;
    return false;
}

function loop(data: Data): boolean {
    const previousIndex = data.index;
    let token = next(data);
    const tags: Token[] = [];
    if (is(token, TokenType.LOOP)) {
        token.loop = null;
        data.loop = token;
        token = next(data);
        if (is(token, TokenType.TAG)) {
            tags.push(token);
            token = next(data);
            while (is(token, TokenType.TAG)) {
                tags.push(token);
                token = next(data);
            }
            if (isValue(token)) {
                let index = 0;
                token.tag = tags[index++];
                token = next(data);
                while (isValue(token)) {
                    if (tags.length <= index) {
                        index = 0;
                    }
                    token.tag = tags[index++];
                    token = next(data);
                }
                if (token) {
                    data.index--;
                }
                return true;
            }
        }
    }
    data.index = previousIndex;
    return false;
}

function next(data: Data): Token {
    if (data.index >= data.tokens.length) {
        return null;
    }
    const result = data.tokens[data.index++];
    result.block = data.block;
    result.loop = data.loop;
    return result;
}

function is(token: Token, type: TokenType): boolean {
    return token && token.type == type;
}

function isValue(token: Token): boolean {
    return token && TokenType.SINGLE <= token.type && token.type <= TokenType.UNQUOTED;
}
