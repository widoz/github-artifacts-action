"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const shoehorn_1 = require("@total-typescript/shoehorn");
const artifacts_1 = require("../../../src/model/artifacts");
globals_1.jest.mock('simple-git', () => ({
    __esModule: true,
    default: {
        commit: globals_1.jest.fn(),
        push: globals_1.jest.fn(),
    },
}));
globals_1.jest.mock('../../../src/configuration', () => ({
    __esModule: true,
    Configuration: {
        command: globals_1.jest.fn(),
        targetDir: globals_1.jest.fn(),
    },
}));
globals_1.jest.mock('../../../src/tags', () => ({
    __esModule: true,
    Tags: {
        collect: globals_1.jest.fn(),
        move: globals_1.jest.fn(),
    },
}));
(0, globals_1.describe)('Artifacts', () => {
    (0, globals_1.it)('Compile the assets and Deploy when finished', () => {
        const git = (0, shoehorn_1.fromPartial)({});
        const tags = (0, shoehorn_1.fromPartial)({ collect: globals_1.jest.fn(), move: globals_1.jest.fn() });
        const configuration = (0, shoehorn_1.fromPartial)({
            command: '',
            targetDir: '',
        });
        const artifacts = new artifacts_1.Artifacts(git, tags, configuration);
        artifacts.update();
    });
});
//# sourceMappingURL=artifacts.test.js.map