import { info, getInput } from '@actions/core';
import { context } from '@actions/github';
import * as fs from 'fs';

export async function updateChangelogFile(
  changeLogPath: string,
  changeLog: string,
): Promise<void> {
  info(`Updating changelog file at '${changeLogPath}'`);

  const title = `# ${context.repo.repo}`;

  const releaseVersion = getInput('release_version', { required: true });
  const commitDate = new Date().toISOString().substr(0, 10);

  let section = `## [Release v${releaseVersion}](https://github.com/${context.repo.owner}/${context.repo.repo}/releases/tag/v${releaseVersion}) (${commitDate})`;
  if (section.length === 0) section = `## Release ${process.env.GITHUB_REF}`;

  let existingContent = '';
  if (fs.existsSync(changeLogPath)) {
    info('File exists, getting content');
    existingContent = (await fs.promises.readFile(changeLogPath)).toString();
  }

  const updatedContent = createNewContent(
    existingContent,
    changeLog,
    title,
    section,
  );

  info('Writing new or updated changelog file');
  await fs.promises.writeFile(changeLogPath, updatedContent);
}

function createNewContent(
  existingContent: string,
  newContent: string,
  title: string,
  section: string,
): string {
  const releaseSection = addNewReleaseSection(section, newContent);

  let updatedContent = '';
  if (existingContent.length === 0) {
    info(`Creating new changelog with title '${title}'`);
    updatedContent = `${title}\n\n${releaseSection}`;
  } else {
    info('Updating existing changelog');

    // Find last release heading which will be a level 2 head
    const lastReleaseIndex = existingContent.indexOf('\n## ');
    if (lastReleaseIndex === -1) {
      // Should never get here really, but if we do append the new changelog to the end
      // as its probably empty
      updatedContent = `${existingContent}\n\n${releaseSection}`;
    } else {
      // Set first part up to last release
      updatedContent = existingContent.substr(0, lastReleaseIndex).trim();
      // Add our new release
      updatedContent += `\n\n${releaseSection}`;
      // Add the remaining previous releases
      updatedContent += existingContent.substr(lastReleaseIndex).trim();
    }
  }

  return updatedContent.trim();
}

function addNewReleaseSection(section: string, content: string): string {
  return `${section}\n\n${content}\n\n`;
}
