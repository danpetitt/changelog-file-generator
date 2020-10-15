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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const changelog_1 = require("./changelog");
const updateChangelogFile_1 = require("./updateChangelogFile");
const commitFiles_1 = require("./commitFiles");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core_1.getInput('token', { required: true });
            const exclude = core_1.getInput('exclude', { required: false }).split(',');
            const updateFile = core_1.getInput('generate', { required: false });
            const files = core_1.getInput('files_to_commit', { required: false }).split(',');
            const octokit = github_1.getOctokit(token);
            const { repo: { owner, repo }, sha, } = github_1.context;
            const { data: tags } = yield octokit.repos.listTags({
                owner,
                repo,
                per_page: 2,
            });
            let tagRef;
            if (tags.length > 0) {
                if (sha === tags[0].commit.sha) {
                    if (tags.length > 1)
                        tagRef = tags[1].commit.sha;
                }
                else
                    tagRef = tags[0].commit.sha;
            }
            const changelog = yield changelog_1.generate(octokit, exclude, owner, repo, tagRef);
            core_1.info(changelog);
            core_1.setOutput('changelog', changelog);
            if (updateFile === 'true') {
                yield updateChangelogFile_1.updateChangelogFile(changelog);
            }
            if (files.length) {
                yield commitFiles_1.commitFiles(files);
            }
        }
        catch (error) {
            core_1.setFailed(error.message);
        }
    });
}
run();
