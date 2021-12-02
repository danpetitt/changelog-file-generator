import fs from 'fs';
import path from 'path';
import { info, getInput, startGroup, endGroup, error } from '@actions/core';
import { context, GitHub } from '@actions/github/lib/utils';
import { Octokit } from '@octokit/rest';

const baseDir = path.join(process.cwd(), getInput('cwd') || '');

export async function commitFiles(
  octokit: InstanceType<typeof GitHub>,
  files: string[],
): Promise<void> {
  info(
    `Committing files to Git running in dir ${baseDir} for ref ${process.env.GITHUB_REF}`,
  );

  startGroup('Internal logs');

  const {
    repo: { owner, repo },
  } = context;

  info('> Installing Octokit Plugin');
  const OctokitPlugin = Octokit.plugin(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('octokit-commit-multiple-files'),
  );

  const token = getInput('token', { required: true });

  info('> Creating Octokit Plugin');
  const octokitPlugin = new OctokitPlugin({ auth: `token ${token}` });

  let branch = getInput('branch') || undefined;
  if (!branch) {
    branch = (
      await octokit.repos.get({
        owner,
        repo,
      })
    ).data.default_branch;
    info(`> Found default branch '${branch}'`);
  }
  info(`> Using branch '${branch}'`);

  const commitMessage = 'ci(pipeline updates): [skip ci]';
  const useremail =
    getInput('user', { required: false }) || 'actions@github.com';
  const username = getInput('userName', { required: false }) || 'Octokit Bot';
  info(`> Committer email '${useremail}'`);
  info(`> Committer name '${username}'`);

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
  try {
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
  } catch (err) {
    error(`> Failed to commit files because: ${JSON.stringify(err)}`);
    throw new Error('Failed to commit files');
  }
  info('> Files committed, all done');

  endGroup();
}
