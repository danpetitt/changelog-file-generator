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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
function generate(octokit, exclude, owner, repo, tagRef) {
    var e_1, _a;
    var _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        exclude = exclude.map((type) => { var _a; return (_a = TYPES[type]) !== null && _a !== void 0 ? _a : type; });
        const repoUrl = `https://github.com/${owner}/${repo}`;
        const commits = {};
        try {
            paginator: for (var _e = __asyncValues(octokit.paginate.iterator(octokit.repos.listCommits, {
                per_page: 100,
                owner,
                repo,
            })), _f; _f = yield _e.next(), !_f.done;) {
                const { data } = _f.value;
                for (let _g of data) {
                    const { sha } = _g, commit = __rest(_g, ["sha"]);
                    if (sha === tagRef)
                        break paginator;
                    const message = commit.commit.message;
                    let [, type, category, title, flag] = COMMIT_REGEX.exec(message) || [];
                    if (!title)
                        continue;
                    type = trim(type);
                    type = (_b = TYPES[type]) !== null && _b !== void 0 ? _b : TYPES.other;
                    category = category ? trim(category) : '';
                    flag = trim(flag);
                    if (flag !== 'breaking')
                        flag = undefined;
                    title = trim(title).replace(PR_REGEX, (match, pull) => `[${match}](${repoUrl}/pull/${pull})`);
                    if (flag)
                        title = title.replace(new RegExp(` ?\\[${flag}\\]$`), '');
                    title = `${title} ([${sha.slice(0, 8)}](${repoUrl}/commit/${sha}))`;
                    if (flag)
                        title += ` **[${flag}]**`;
                    commits[type] = (_c = commits[type]) !== null && _c !== void 0 ? _c : {};
                    commits[type][category] = (_d = commits[type][category]) !== null && _d !== void 0 ? _d : [];
                    commits[type][category].push(title);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) yield _a.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Object.values(TYPES)
            .filter((type) => !exclude.includes(type))
            .sort()
            .reduce((changelog, type) => {
            const typeGroup = commits[type];
            if (typeGroup == null)
                return changelog;
            changelog.push(`### ${type}`, '');
            const categories = Object.keys(typeGroup).sort();
            for (const category of categories) {
                const categoryGroup = typeGroup[category];
                const defaultCategory = category.length === 0;
                if (!defaultCategory)
                    changelog.push(`* **${category}:**`);
                const baseLine = defaultCategory ? '' : '  ';
                for (const title of categoryGroup) {
                    changelog.push(baseLine + '* ' + title);
                }
            }
            changelog.push('');
            return changelog;
        }, [])
            .join('\n');
    });
}
exports.generate = generate;
function trim(value) {
    if (value == null)
        return value;
    return value.trim().replace(/ {2,}/g, ' ');
}
const COMMIT_REGEX = /^([^)]*)(?:\(([^)]*?)\)|):(.*?(?:\[([^\]]+?)\]|))\s*$/;
const PR_REGEX = /#([1-9]\d*)/g;
const TYPES = {
    breaking: 'Breaking Changes',
    build: 'Build System / Dependencies',
    ci: 'Continuous Integration',
    chore: 'Chores',
    docs: 'Documentation Changes',
    feat: 'New Features',
    fix: 'Bug Fixes',
    other: 'Other Changes',
    perf: 'Performance Improvements',
    refactor: 'Refactors',
    revert: 'Reverts',
    style: 'Code Style Changes',
    test: 'Tests',
};
