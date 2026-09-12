export const REMOTE = {
  owner: 'RADINMNX2',
  repo: 'rozhina',
  branch: 'main',
};

export const remoteDataUrl = (path) =>
  `https://raw.githubusercontent.com/${REMOTE.owner}/${REMOTE.repo}/${REMOTE.branch}/${path}`;

export const fetchRemoteJs = async (path, exportExpr) => {
  const res = await fetch(remoteDataUrl(path));
  if (!res.ok) throw new Error(`remote ${path}: ${res.status}`);
  const text = await res.text();
  const src = text.replace(/^export\s+/gm, '');
  const fn = new Function(`${src};\nreturn ${exportExpr};`);
  return fn();
};

let readyFlag = false;
let resolvers = [];
let attempts = 0;

export const remoteReadyFlag = () => readyFlag;

export const whenRemoteReady = () =>
  readyFlag ? Promise.resolve() : new Promise((resolve) => resolvers.push(resolve));

export const notifyRemoteAttempt = () => {
  attempts += 1;
  if (attempts >= 3 && !readyFlag) {
    readyFlag = true;
    const pending = resolvers;
    resolvers = [];
    pending.forEach((resolve) => resolve());
  }
};