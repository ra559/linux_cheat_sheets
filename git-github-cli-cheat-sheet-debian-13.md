# Git and GitHub CLI Cheat Sheet for Debian 13

A practical reference for using Git and GitHub CLI (`gh`) together from the terminal. Includes installation, repository setup, commits, branches, remotes, SSH, pull requests, issues, releases, Actions, troubleshooting, and recovery commands.

## Table of Contents

- [1. Git and GitHub CLI: What Is the Difference?](#1-git-and-github-cli-what-is-the-difference)
- [2. Install Git and GitHub CLI on Debian 13](#2-install-git-and-github-cli-on-debian-13)
- [3. Initial Git Configuration](#3-initial-git-configuration)
- [4. Authenticate GitHub CLI](#4-authenticate-github-cli)
- [5. Create or Clone a Repository](#5-create-or-clone-a-repository)
- [6. Everyday Git Workflow](#6-everyday-git-workflow)
- [7. Inspect Changes and History](#7-inspect-changes-and-history)
- [8. Branches and Merging](#8-branches-and-merging)
- [9. Remotes and Synchronization](#9-remotes-and-synchronization)
- [10. GitHub CLI Repository Commands](#10-github-cli-repository-commands)
- [11. Pull Requests](#11-pull-requests)
- [12. Issues and Discussions](#12-issues-and-discussions)
- [13. Releases and Tags](#13-releases-and-tags)
- [14. GitHub Actions](#14-github-actions)
- [15. SSH Setup for GitHub](#15-ssh-setup-for-github)
- [16. Undo and Recover Changes](#16-undo-and-recover-changes)
- [17. Ignore Files and Useful Configuration](#17-ignore-files-and-useful-configuration)
- [18. Troubleshooting](#18-troubleshooting)
- [19. Safety Notes](#19-safety-notes)
- [20. Quick Reference](#20-quick-reference)
- [21. Help and Documentation](#21-help-and-documentation)

---

## 1. Git and GitHub CLI: What Is the Difference?

- **Git** is a version control system. It tracks changes, creates commits, and manages branches and merges locally.
- **GitHub** is a hosting and collaboration platform for Git repositories.
- **GitHub CLI (`gh`)** is GitHub's command-line tool. It helps manage GitHub repositories, pull requests, issues, releases, and Actions from the terminal.

Typical workflow:

```bash
git status
git add .
git commit -m "Describe the change"
git push
gh pr create
```

`git` commands work with local repositories and configured remotes. `gh` commands generally require GitHub CLI authentication and a GitHub repository context.

## 2. Install Git and GitHub CLI on Debian 13

### Install Git

```bash
sudo apt update
sudo apt install git
```

Check the version:

```bash
git --version
```

### Install GitHub CLI (`gh`)

GitHub CLI may be available in Debian's repositories, but the version can differ from GitHub's official packages. To install the version from GitHub's official APT repository, use the current instructions in the official documentation:

https://github.com/cli/cli/blob/trunk/docs/install_linux.md

The official repository setup commonly uses an APT signing key and a repository entry. Follow the current instructions for Debian rather than copying an old key URL or repository configuration.

If `gh` is already available from your configured package sources, you can install it with:

```bash
sudo apt install gh
```

Verify:

```bash
gh --version
```

## 3. Initial Git Configuration

Set the name and email to associate with your commits:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Check configuration:

```bash
git config --global --list
```

Set the default initial branch name:

```bash
git config --global init.defaultBranch main
```

Set Vim as Git's default editor:

```bash
git config --global core.editor vim
```

Check a specific setting:

```bash
git config --global user.name
git config --global core.editor
```

Configuration levels:

- `--system`: applies to all users on the system.
- `--global`: applies to your user account.
- `--local`: applies only to the current repository.

Local settings override global settings.

## 4. Authenticate GitHub CLI

Start the interactive login flow:

```bash
gh auth login
```

Choose GitHub.com, then select HTTPS or SSH according to your preferred Git transport. Follow the prompts to authenticate.

Check authentication status:

```bash
gh auth status
```

View available authentication options:

```bash
gh auth login --help
```

Log out:

```bash
gh auth logout
```

`gh` authentication and Git authentication are related but not identical. Git operations over HTTPS may use credentials managed by GitHub CLI if configured, while SSH operations depend on your SSH keys and agent.

## 5. Create or Clone a Repository

### Create a local repository

```bash
mkdir my-project
cd my-project
git init
```

Check status:

```bash
git status
```

### Clone an existing GitHub repository

Using SSH:

```bash
git clone git@github.com:USERNAME/REPOSITORY.git
```

Using HTTPS:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
```

Change into the cloned directory:

```bash
cd REPOSITORY
```

GitHub CLI can also clone repositories:

```bash
gh repo clone USERNAME/REPOSITORY
```

### Create a GitHub repository from the current directory

From an existing local Git repository:

```bash
gh repo create my-project --source=. --remote=origin --private
```

Use `--public` instead of `--private` if you intend the repository to be publicly visible. Review the visibility choice before creating the repository.

To create a repository interactively:

```bash
gh repo create
```

## 6. Everyday Git Workflow

Check repository status:

```bash
git status
```

Stage one file:

```bash
git add README.md
```

Stage several files:

```bash
git add file1.rb file2.rb
```

Stage all changes under the current directory:

```bash
git add .
```

Review staged changes:

```bash
git diff --staged
```

Commit staged changes:

```bash
git commit -m "Add README"
```

Stage and commit tracked-file modifications in one command:

```bash
git commit -am "Fix validation"
```

**Note:** `git commit -am` does not stage new, untracked files.

Push the current branch:

```bash
git push
```

If it has no upstream configured yet:

```bash
git push -u origin HEAD
```

Pull updates from the configured upstream:

```bash
git pull
```

A common cycle:

```bash
git status
git add .
git diff --staged
git commit -m "Describe the change"
git push
```

## 7. Inspect Changes and History

Show working tree status:

```bash
git status
```

Show unstaged changes:

```bash
git diff
```

Show staged changes:

```bash
git diff --staged
```

Show recent commits:

```bash
git log --oneline
```

Show a graph of branches and commits:

```bash
git log --oneline --graph --decorate --all
```

Show details of the latest commit:

```bash
git show
```

Show changes to one file:

```bash
git diff -- README.md
```

Show which files changed in recent commits:

```bash
git log --stat
```

List tracked files:

```bash
git ls-files
```

Find who last changed each line in a file:

```bash
git blame README.md
```

## 8. Branches and Merging

List local branches:

```bash
git branch
```

List local and remote-tracking branches:

```bash
git branch -a
```

Create a branch:

```bash
git branch feature-login
```

Create and switch to a branch:

```bash
git switch -c feature-login
```

Switch branches:

```bash
git switch main
```

Merge a branch into the current branch:

```bash
git merge feature-login
```

Delete a merged local branch:

```bash
git branch -d feature-login
```

Delete a branch forcefully (only when you are sure it is no longer needed):

```bash
git branch -D feature-login
```

Delete a remote branch:

```bash
git push origin --delete feature-login
```

Update remote-tracking references and remove ones that no longer exist remotely:

```bash
git fetch --prune
```

### Rebase a feature branch

```bash
git switch feature-login
git fetch origin
git rebase origin/main
```

Rebasing rewrites commits. Avoid rebasing shared branches unless the team agrees on that workflow.

## 9. Remotes and Synchronization

List configured remotes:

```bash
git remote -v
```

Add a remote:

```bash
git remote add origin git@github.com:USERNAME/REPOSITORY.git
```

Change an existing remote URL:

```bash
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

Verify the remote:

```bash
git remote -v
```

Rename a remote:

```bash
git remote rename origin upstream
```

Remove a remote:

```bash
git remote remove origin
```

Fetch remote updates without merging:

```bash
git fetch origin
```

Fetch and prune deleted remote branches:

```bash
git fetch --prune origin
```

Pull updates:

```bash
git pull
```

Push current branch and set upstream:

```bash
git push -u origin HEAD
```

Push an existing branch:

```bash
git push
```

If you accidentally added the wrong remote URL, correct it instead of adding `origin` a second time:

```bash
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

## 10. GitHub CLI Repository Commands

Show the current repository in GitHub CLI:

```bash
gh repo view
```

View a particular repository:

```bash
gh repo view USERNAME/REPOSITORY
```

Open the repository in a browser:

```bash
gh repo view --web
```

List your repositories:

```bash
gh repo list
```

List repositories for an organization:

```bash
gh repo list ORGANIZATION
```

Create a repository:

```bash
gh repo create
```

Clone a repository:

```bash
gh repo clone USERNAME/REPOSITORY
```

Fork a repository:

```bash
gh repo fork USERNAME/REPOSITORY
```

Set the repository's Git remote to an SSH URL:

```bash
gh repo set-default
```

`gh repo set-default` selects the default repository for GitHub CLI commands in the current directory; it does not change your Git remote URL.

## 11. Pull Requests

List open pull requests:

```bash
gh pr list
```

View a pull request:

```bash
gh pr view 42
```

View the pull request in a browser:

```bash
gh pr view 42 --web
```

Create a pull request interactively:

```bash
gh pr create
```

Create a pull request with a title and body:

```bash
gh pr create --title "Add login feature" --body "Implements login validation."
```

Check out a pull request locally:

```bash
gh pr checkout 42
```

Review a pull request:

```bash
gh pr review 42
```

Approve a pull request:

```bash
gh pr review 42 --approve
```

Request changes:

```bash
gh pr review 42 --request-changes --body "Please add tests."
```

Merge a pull request:

```bash
gh pr merge 42
```

Choose a merge strategy when merging:

```bash
gh pr merge 42 --squash
gh pr merge 42 --merge
gh pr merge 42 --rebase
```

Use only the merge method enabled by the repository's settings and team workflow.

## 12. Issues and Discussions

List issues:

```bash
gh issue list
```

View an issue:

```bash
gh issue view 123
```

Create an issue:

```bash
gh issue create
```

Create an issue with a title and body:

```bash
gh issue create --title "Fix login bug" --body "Describe the steps to reproduce."
```

Close an issue:

```bash
gh issue close 123
```

Reopen an issue:

```bash
gh issue reopen 123
```

Search issues:

```bash
gh issue list --search "is:open label:bug"
```

List discussions, where supported by the repository and CLI version:

```bash
gh discussion list
```

Use `gh issue --help` or `gh discussion --help` to check available commands for your installed version and repository permissions.

## 13. Releases and Tags

List releases:

```bash
gh release list
```

View a release:

```bash
gh release view
```

Create a Git tag:

```bash
git tag v1.0.0
```

Push a tag:

```bash
git push origin v1.0.0
```

List tags:

```bash
git tag
```

Create an annotated tag:

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
```

Create a GitHub release from a tag:

```bash
gh release create v1.0.0 --title "v1.0.0" --notes "First stable release."
```

Create a release and automatically generate notes from repository history:

```bash
gh release create v1.0.0 --generate-notes
```

Upload a release asset:

```bash
gh release upload v1.0.0 ./build.zip
```

## 14. GitHub Actions

List recent workflow runs:

```bash
gh run list
```

View a run:

```bash
gh run view RUN_ID
```

View logs for a run:

```bash
gh run view RUN_ID --log
```

Watch a run until it completes:

```bash
gh run watch RUN_ID
```

List workflows:

```bash
gh workflow list
```

Run a workflow manually when it supports `workflow_dispatch`:

```bash
gh workflow run WORKFLOW_NAME.yml
```

Rerun a workflow:

```bash
gh run rerun RUN_ID
```

Cancel a workflow run:

```bash
gh run cancel RUN_ID
```

## 15. SSH Setup for GitHub

Check whether you already have SSH keys:

```bash
ls -la ~/.ssh
```

Generate an Ed25519 key:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
```

Start the SSH agent in a typical Bash session and add the key:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Print the public key to add to GitHub:

```bash
cat ~/.ssh/id_ed25519.pub
```

Add the public key in GitHub account settings under SSH keys. Never share or upload the private key (`~/.ssh/id_ed25519`).

Test authentication:

```bash
ssh -T git@github.com
```

Use an SSH remote:

```bash
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

Confirm the URL:

```bash
git remote -v
```

## 16. Undo and Recover Changes

### Discard unstaged changes to a tracked file

```bash
git restore README.md
```

This permanently discards unstaged changes in that file.

### Unstage a file but keep its edits

```bash
git restore --staged README.md
```

### Amend the most recent commit

```bash
git commit --amend
```

Amend without changing the commit message:

```bash
git commit --amend --no-edit
```

Avoid amending commits that have already been shared unless you understand the impact on collaborators.

### Revert a commit safely

```bash
git revert COMMIT_ID
```

This creates a new commit that reverses the specified commit's changes.

### Reset to an earlier commit

```bash
git reset --soft COMMIT_ID
git reset --mixed COMMIT_ID
git reset --hard COMMIT_ID
```

- `--soft` moves `HEAD` but keeps changes staged.
- `--mixed` moves `HEAD` and leaves changes unstaged (default).
- `--hard` resets the index and working tree. Uncommitted changes can be permanently lost.

### Recover using the reflog

```bash
git reflog
```

The reflog shows recent movements of local references such as `HEAD`. It can help find commits that are no longer visible in the current branch history.

### Remove an untracked file or directory

Preview what would be removed:

```bash
git clean -n
```

Remove untracked files:

```bash
git clean -f
```

Preview untracked files and directories:

```bash
git clean -nd
```

Remove untracked files and directories:

```bash
git clean -fd
```

These commands can permanently delete untracked work. Always preview first.

## 17. Ignore Files and Useful Configuration

Create a `.gitignore` file to exclude files that should not be tracked.

Example:

```gitignore
.env
*.log
tmp/
vendor/
node_modules/
.DS_Store
```

Check whether a file is ignored and why:

```bash
git check-ignore -v .env
```

If a file is already tracked, adding it to `.gitignore` does not untrack it. To stop tracking it while keeping the local file:

```bash
git rm --cached .env
git commit -m "Stop tracking local environment file"
```

Show configured Git settings and their sources:

```bash
git config --list --show-origin
```

Set Vim as the editor:

```bash
git config --global core.editor vim
```

Set pull to use fast-forward only:

```bash
git config --global pull.ff only
```

This prevents `git pull` from creating a merge commit automatically; pulls may fail when a fast-forward is not possible.

## 18. Troubleshooting

### `origin` already exists

Inspect remotes:

```bash
git remote -v
```

Correct the URL:

```bash
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

### Push rejected because the remote has new commits

Fetch and inspect:

```bash
git fetch origin
git log --oneline --graph --decorate --all
```

If appropriate for your workflow, integrate the remote branch:

```bash
git pull --rebase
```

Resolve conflicts, then continue the rebase if prompted:

```bash
git add RESOLVED_FILE
git rebase --continue
```

Abort a rebase if needed:

```bash
git rebase --abort
```

### SSH permission denied

Test the SSH connection:

```bash
ssh -T git@github.com
```

Check the remote URL:

```bash
git remote -v
```

Verify that the correct public key is added to GitHub and that the private key is available to your SSH agent.

### `gh` is not authenticated

```bash
gh auth status
gh auth login
```

### See which branch is tracking which remote branch

```bash
git branch -vv
```

### Check the current branch

```bash
git branch --show-current
```

## 19. Safety Notes

- Review `git status` and `git diff --staged` before committing.
- Never commit private SSH keys, passwords, tokens, or `.env` files.
- `git reset --hard`, `git clean -fd`, and force-push operations can destroy work or disrupt collaborators.
- Prefer `git revert` for reversing commits that have already been shared.
- Before force-pushing a rewritten branch, coordinate with collaborators. If necessary, prefer `git push --force-with-lease` over `--force`, but understand the consequences.
- Check repository visibility before creating a public GitHub repository.
- Review permissions and the target repository before merging pull requests or publishing releases.

## 20. Quick Reference

| Task | Command |
|---|---|
| Check status | `git status` |
| Stage changes | `git add .` |
| Commit changes | `git commit -m "Message"` |
| Push branch | `git push` |
| Set upstream on first push | `git push -u origin HEAD` |
| Show remotes | `git remote -v` |
| Change remote URL | `git remote set-url origin URL` |
| Show history | `git log --oneline --graph --all` |
| Create branch | `git switch -c BRANCH` |
| Switch branch | `git switch BRANCH` |
| Fetch remote changes | `git fetch` |
| Clone GitHub repo | `gh repo clone OWNER/REPO` |
| View repository | `gh repo view` |
| Create pull request | `gh pr create` |
| List pull requests | `gh pr list` |
| Create issue | `gh issue create` |
| List workflow runs | `gh run list` |
| Check `gh` login | `gh auth status` |
| Test SSH | `ssh -T git@github.com` |

Replace placeholders such as `USERNAME`, `REPOSITORY`, `BRANCH`, and `COMMIT_ID` with your actual values.

## 21. Help and Documentation

Git help:

```bash
git --help
git help commit
git help rebase
```

GitHub CLI help:

```bash
gh --help
gh repo --help
gh pr --help
gh run --help
```

Official documentation:

- Git documentation: https://git-scm.com/doc
- GitHub CLI manual: https://cli.github.com/manual/
- GitHub CLI installation: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
- GitHub SSH documentation: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
