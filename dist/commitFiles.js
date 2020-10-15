"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitFiles = void 0;
const core_1 = require("@actions/core");
const simple_git_1 = __importDefault(require("simple-git"));
const path_1 = __importDefault(require("path"));
const baseDir = path_1.default.join(process.cwd(), core_1.getInput('cwd') || '');
const git = simple_git_1.default({ baseDir });
function commitFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        core_1.info(`Git running in dir ${baseDir}`);
        let commitMessage = core_1.getInput('commit_message', { required: false });
        if (commitMessage.length === 0)
            commitMessage = 'chore(pipeline updates): [skip ci]';
        yield add(files);
        core_1.info('Checking for changes...');
        const changedFiles = (yield git.diffSummary(['--cached'])).files.length;
        if (changedFiles > 0) {
            core_1.info(`> Found ${changedFiles} changed files`);
        }
        core_1.info('Creating commit...');
        yield git.commit(commitMessage, undefined, {}, log);
    });
}
exports.commitFiles = commitFiles;
function add(files, { logWarning = true, ignoreErrors = false } = {}) {
    return git
        .add(files, (e, d) => ignoreErrors ? null : core_1.info(`${e}: ${d !== null && d !== void 0 ? d : ''}`))
        .catch((e) => {
        if (ignoreErrors)
            return;
        if (e.message.includes('fatal: pathspec') &&
            e.message.includes('did not match any files')) {
            logWarning && core_1.warning('Add command did not match any file.');
        }
        else {
            throw e;
        }
    });
}
function log(err, data) {
    if (data)
        console.log(data);
    if (err)
        core_1.error(err);
}
