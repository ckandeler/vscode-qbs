import * as vscode from 'vscode';
import * as cp from 'child_process';

export async function enumerateProjects(): Promise<vscode.Uri[]> {
    return await vscode.workspace.findFiles('*.qbs');
}

export async function enumerateBuildProfiles(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        const qbsPath = vscode.workspace.getConfiguration('qbs').get('qbsPath');
		cp.exec(qbsPath + ' config --list', (error, stdout, stderr) => {
            if (error) {
                reject(undefined);
            } else {
                let profiles: string[] = [];
                stdout.split('\n').map(function (line) {
                    if (!line.startsWith('profiles'))
                        return;
                    const startIndex = line.indexOf('.');
                    if (startIndex !== -1) {
                        const endIndex = line.indexOf('.', startIndex + 1);
                        if (endIndex != -1) {
                            const profile = line.substring(startIndex + 1, endIndex);
                            if (profiles.indexOf(profile) === -1)
                                profiles.push(profile);
                        }
                    }
                });
                resolve(profiles);
            }
		});
    });
}

export async function enumerateBuildConfigurations(): Promise<string[]> {
    return ['debug', 'release'];
}
