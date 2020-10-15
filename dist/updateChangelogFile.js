"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChangelogFile = void 0;
const core_1 = require("@actions/core");
const fs = __importStar(require("fs"));
function updateChangelogFile(changeLog) {
    return __awaiter(this, void 0, void 0, function* () {
        let changeLogPath = core_1.getInput('path', { required: false });
        if (changeLogPath.length === 0)
            changeLogPath = './CHANGELOG.md';
        core_1.info(`Updating changelog file at ${changeLogPath}`);
        let title = core_1.getInput('title', { required: false });
        if (title.length === 0)
            title = '# Changelog';
        let section = core_1.getInput('section', { required: false });
        if (section.length === 0)
            section = `## Release ${process.env.GITHUB_REF}`;
        let existingContent = '';
        fs.access(changeLogPath, fs.constants.F_OK, (err) => __awaiter(this, void 0, void 0, function* () {
            if (!err) {
                existingContent = (yield fs.promises.readFile(changeLogPath)).toString();
            }
        }));
        const updatedContent = createNewContent(existingContent, changeLog, title, section);
        core_1.info('Writing new or updated changelog file');
        yield fs.promises.writeFile(changeLogPath, updatedContent);
    });
}
exports.updateChangelogFile = updateChangelogFile;
function createNewContent(existingContent, newContent, title, section) {
    let updatedContent = '';
    if (existingContent.length === 0) {
        updatedContent = `${title}\n\n${addNewReleaseSection(newContent, section)}`;
    }
    else {
        // Remove original heading so we can add our new section then add it back
        const strippedContent = existingContent.replace(title, '').trim();
        const releaseSection = addNewReleaseSection(newContent, section);
        updatedContent = `${title}\n\n${releaseSection}${strippedContent}`;
    }
    return updatedContent;
}
function addNewReleaseSection(content, section) {
    return `\n\n${section}\n\n${content}\n\n`;
}
