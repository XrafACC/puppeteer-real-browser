import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { getCommitsBetween, repoURL, getGitTags, owner, repo } from '../utils/octokit.mjs';
import { typeMap } from '../utils/commitOptions.mjs';

const changelogHeader =
   '# Changelog\n\n' +
   'All notable changes to this project will be documented in this file.\n\n' +
   'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n' +
   'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';

const outputPath = resolve(process.cwd(), 'CHANGELOG.md');

if (import.meta.url === `file://${process.argv[1]}`) {
   void generateChangelog().then(content => {
      writeFileSync(outputPath, content, 'utf8');
      console.log('Changelog generated');
   });
}

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function shortHash(hash) {
   return hash.slice(0, 7);
}

export function formatCommitLink(hash, repoUrl) {
   return `[${shortHash(hash)}](${repoUrl}/commit/${hash})`;
}

function isDependabot(commit) {
   return commit.authorName?.includes('dependabot') || commit.authorEmail?.includes('dependabot') || commit.body?.includes('updated-dependencies:');
}

function parseDependabotDeps(body = '') {
   const deps = [];
   const rx = /dependency-name:\s*"?([^"\n]+)"?\s+dependency-version:\s*([^\s]+)/g;

   let m;
   while ((m = rx.exec(body)) !== null) {
      deps.push({ name: m[1], version: m[2] });
   }
   return deps;
}

function dependabotAuthor() {
   return 'by [@dependabot](https://github.com/dependabot)';
}

/* -------------------------------------------------- */
/* Commit Parsing                                     */
/* -------------------------------------------------- */

export function parseCommit(commit) {
   /* ---------- Dependabot ---------- */
   if (isDependabot(commit)) {
      const deps = parseDependabotDeps(commit.body);

      return deps.map(dep => ({
         type: 'deps',
         scope: dep.name,
         description: `bump to ${dep.version}`,
         hash: commit.hash,
         date: commit.date,
         author: dependabotAuthor(),
         isDependabot: true,
      }));
   }

   /* ---------- Normal commits ---------- */

   function formatAuthor(name, email) {
      if (!name || !email) return '';
      let user = name;
      if (email.includes('@users.noreply.github.com')) {
         user = email.split('@')[0];
      }
      return `by [@${user}](https://github.com/${user})`;
   }

   const author = commit.authorName && commit.authorEmail ? formatAuthor(commit.authorName, commit.authorEmail) : '';

   const conventional = /(\w+)(?:\(([^)]+)\))?:\s(.+)/g;

   const matches = [...(commit.body || '').matchAll(conventional)];

   if (matches.length > 0) {
      return matches.map(m => ({
         type: m[1],
         scope: m[2] ?? null,
         description: m[3].trim(),
         hash: commit.hash,
         date: commit.date,
         author,
         isDependabot: false,
      }));
   }

   return [
      {
         type: 'chore',
         scope: null,
         description: commit.subject,
         hash: commit.hash,
         date: commit.date,
         author,
         isDependabot: false,
      },
   ];
}

/* -------------------------------------------------- */
/* Grouping                                          */
/* -------------------------------------------------- */

function groupCommits(parsed) {
   const grouped = {};
   const depsIndex = new Map(); // scope -> commit

   for (const c of parsed) {
      const type = typeMap[c.type] ? c.type : 'chore';
      grouped[type] ||= [];

      if (c.type === 'deps') {
         const key = c.scope;

         const existing = depsIndex.get(key);

         if (!existing) {
            depsIndex.set(key, c);
            grouped[type].push(c);
            continue;
         }

         // Dependabot ALWAYS wins
         if (c.isDependabot && !existing.isDependabot) {
            const i = grouped[type].indexOf(existing);
            if (i !== -1) grouped[type][i] = c;
            depsIndex.set(key, c);
         }

         continue;
      }

      grouped[type].push(c);
   }

   return grouped;
}

/* -------------------------------------------------- */
/* Generators                                         */
/* -------------------------------------------------- */

export async function generateUncommittedChangelog() {
   const tags = [...new Set(await getGitTags(owner, repo))].filter(Boolean);
   const commits = await getCommitsBetween(owner, repo, tags[0] ?? '');
   if (!commits.length) return '';

   const grouped = groupCommits(commits.flatMap(parseCommit));
   let out = '';

   for (const type of Object.keys(typeMap)) {
      if (!grouped[type]) continue;
      if (type === 'changelog') continue;
      const label = typeMap[type];
      out += `### ${label.emoji} ${label.text}\n\n`;

      for (const c of grouped[type]) {
         const link = formatCommitLink(c.hash, repoURL);
         const scope = c.scope ? `**${c.scope}:** ` : '';
         out += `- ${scope}${c.description} ${c.author} (${link})\n`;
      }
      out += '\n';
   }

   return out;
}

async function generateChangelog() {
   const tags = [...new Set(await getGitTags(owner, repo))].filter(Boolean);
   let out = changelogHeader;

   /* ---------- Latest ---------- */
   const latest = await getCommitsBetween(owner, repo, tags[0] ?? '');
   if (latest.length) {
      out += '## Latest\n\n';
      const grouped = groupCommits(latest.flatMap(parseCommit));

      for (const type of Object.keys(typeMap)) {
         if (!grouped[type]) continue;
         const label = typeMap[type];
         out += `### ${label.emoji} ${label.text}\n\n`;

         for (const c of grouped[type]) {
            const link = formatCommitLink(c.hash, repoURL);
            const scope = c.scope ? `**${c.scope}:** ` : '';
            out += `- ${scope}${c.description} ${c.author} (${link})\n`;
         }
         out += '\n';
      }
   }

   /* ---------- Releases ---------- */
   for (let i = 0; i < tags.length; i++) {
      const cur = tags[i];
      const prev = tags[i + 1];

      // eslint-disable-next-line no-await-in-loop
      const commits = await getCommitsBetween(owner, repo, prev, cur);
      if (!commits.length) continue;

      const parsed = commits.flatMap(parseCommit);
      const grouped = groupCommits(parsed);

      const url = prev ? `${repoURL}/compare/${prev}...${cur}` : `${repoURL}/releases/tag/${cur}`;

      const date = parsed[0]?.date ?? new Date().toISOString().split('T')[0];

      out += `## [${cur}](${url}) - ${date}\n\n`;

      for (const type of Object.keys(typeMap)) {
         if (!grouped[type]) continue;
         const label = typeMap[type];
         out += `### ${label.emoji} ${label.text}\n\n`;

         for (const c of grouped[type]) {
            const link = formatCommitLink(c.hash, repoURL);
            const scope = c.scope ? `**${c.scope}:** ` : '';
            out += `- ${scope}${c.description} ${c.author} (${link})\n`;
         }
         out += '\n';
      }
   }

   return out.replace(/\n{3,}/g, '\n\n');
}
