/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import { spawn } from 'child_process';
import path from 'path';
import Account from '../types/Accounts';

// const isDebug = process.env.NODE_ENV === 'development';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function autoFill(account: Account) {
  return new Promise((resolve, reject) => {
    const { userName, password } = account;

    const autoFillPath = path.resolve(
      __dirname,
      '../../../autofill/bin/Debug/net7.0-windows/AutoFill.exe'
    );

    const args = [
      `--username=${userName}`,
      `--password=${password}`,
      '--remember-me=true',
      '--game-type=league_of_legends',
    ];

    const child = spawn(autoFillPath, args);

    // return when autofill is done

    child.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data: any) => {
      console.error(`stderr: ${data}`);
      reject(data);
    });

    child.on('close', (code: any) => {
      console.log(`child process exited with code ${code}`);
      resolve(code);
    });
  });
}
