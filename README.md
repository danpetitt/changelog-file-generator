# Changelog File Generator

This action is based upon auto-changelog by [Ardalan Amini](https://github.com/ardalanamini/auto-changelog) and add-and-commit [Federico Grandi](https://github.com/EndBug/add-and-) with some updates to generate a changelog file and commit it to your repo.

## Usage

To use this action, your commit messages have to follow the format below:

```git
type(category): description [flag]
```

The `type` must be one of the followings:

* `breaking`
* `build`
* `ci`
* `chore`
* `docs`
* `feat`
* `fix`
* `other`
* `perf`
* `refactor`
* `revert`
* `style`
* `test`

> If the `type` is not found in the list, it'll be considered as `other`.

The `category` is optional and can be anything of your choice.

The `flag` is optional (if provided, it must be surrounded in square brackets). (eg. `breaking`)

### Inputs

#### `token`

**Required** Github token.

#### `release_version`

**Required** Specify the current version to be released without any prefix like `v`

#### `exclude`

Exclude selected commit types (comma separated).

#### `file`

Specify a file path to generate or update a change log file.

#### `files_to_commit`

Commits any files, like the updated changelog file, to the repo on completion (comma separated). Does not commit anything by default.

#### `user`

Optional user email attributed to the committed files (default `actions@github.com`).

#### `userName`

Optional user name attributed to the committed files (default `Octokit Bot`).

#### `branch`

Optional branch to commit files into (default `repo's default-branch`).

### Outputs

#### `changelog`

The generated changelog.

### Example usage

```yaml
uses: danpetitt/changelog-file-generator@v2.1.0
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  release_version: '2.1.0'
  exclude: 'perf,other,breaking'
  file: './CHANGELOG.md'
  files_to_commit: './CHANGELOG.md',./coverage-badge-branch.svg
  branch: main
  user: 'user@user.com'
  userName: 'A User'
```
