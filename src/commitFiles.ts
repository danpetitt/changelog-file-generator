import fs from 'fs';
import path from 'path';
import { info, getInput, startGroup, endGroup } from '@actions/core';
import { context, GitHub } from '@actions/github/lib/utils';
import { Octokit } from '@octokit/core';

const baseDir = path.join(process.cwd(), getInput('cwd') || '');

export async function commitFiles(
  octokit: InstanceType<typeof GitHub>,
  files: string[],
): Promise<void> {
  info(
    `Committing files to Git running in dir ${baseDir} for ref ${process.env.GITHUB_REF}`,
  );

  const OctokitPlugin = Octokit.plugin(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('octokit-commit-multiple-files'),
  );

  const octokitPlugin = new OctokitPlugin({ auth: octokit.auth });

  startGroup('Internal logs');

  const branch = getInput('branch') || undefined;
  info(`> Branch '${branch ?? 'default branch'}'`);

  const commitMessage = 'ci(pipeline updates): [skip ci]';
  const useremail =
    getInput('user', { required: false }) || 'actions@github.com';
  const username = getInput('userName', { required: false }) || 'Octokit Bot';
  info(`> Committer email '${useremail}'`);
  info(`> Committer name '${username}'`);

  const {
    repo: { owner, repo },
  } = context;

  interface FileChanges {
    [key: string]: string;
  }

  const fileInfo: FileChanges = {};
  for (const file of files) {
    info(`> Adding file '${file}'`);
    const content = fs.readFileSync(file, 'utf-8');
    fileInfo[file] = content;
  }

  info('> Committing changes');
  await octokitPlugin.repos.createOrUpdateFiles({
    owner,
    repo,
    branch,
    createBranch: false,
    changes: [
      {
        message: commitMessage,
        files: fileInfo,
      },
    ],
    committer: {
      name: username,
      email: useremail,
    },
    author: {
      name: username,
      email: useremail,
    },
  });

  endGroup();
}
