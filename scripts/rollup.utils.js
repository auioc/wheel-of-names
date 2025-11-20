import { execSync as _execSync } from 'child_process';

const dev = process.env.NODE_ENV !== 'production';

const execSync = (cmd) => _execSync(cmd).toString().trim();
const commitHash = () => execSync('git rev-parse --verify HEAD');
const branch = () => execSync('git branch --show-current');
const isDirty = () => execSync('git status --short').length !== 0;
export function version() {
    const r = {
        branch: branch(),
        commit: commitHash(),
        dirty: isDirty(),
        dev: dev,
        text: '',
    };
    r.text = `${r.branch}@${r.commit.slice(0, 8)}`;
    if (r.dirty) {
        r.text += '*';
    }
    if (dev) {
        r.text += '(dev)';
    }
    return r;
}

export function cssComment(s) {
    return (
        '/*!\n' +
        s
            .split('\n')
            .map((x) => ` * ${x}`)
            .join('\n') +
        '\n */'
    );
}
