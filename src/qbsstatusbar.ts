import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

import { basename } from 'path'; 

// From user code.
import {QbsSession, QbsSessionStatus} from './qbssession';

const localize: nls.LocalizeFunc = nls.loadMessageBundle();

export class QbsStatusBar implements vscode.Disposable {
    // Private members.
    private _statusButton: vscode.StatusBarItem;
    private _projectButton: vscode.StatusBarItem;
    private _profileButton: vscode.StatusBarItem;
    private _configurationButton: vscode.StatusBarItem;

    // Constructors.
    constructor(private readonly _session: QbsSession) {
        // Create the QBS session status button.
        this._statusButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._statusButton.tooltip = localize('qbs.status.tooltip', 'QBS session status');
        this._statusButton.show();

        // Create the QBS project file selection button.
        this._projectButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._projectButton.tooltip = localize('qbs.active.project.select.tooltip', 'Click to select the active project');
        this._projectButton.command = 'qbs.selectProject';
        this._projectButton.show();

        // Create the QBS build profile selection button.
        this._profileButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._profileButton.tooltip = localize('qbs.build.profile.select.tooltip', 'Click to select the build profile');
        this._profileButton.command = 'qbs.selectProfile';
        this._profileButton.show();

        // Create the QBS build configuration selection button.
        this._configurationButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._configurationButton.tooltip = localize('qbs.build.configuration.select.tooltip', 'Click to select the build configuration');
        this._configurationButton.command = 'qbs.selectConfiguration';
        this._configurationButton.show();

        // Subscribe on the session events.
        _session.onStatusChanged(status => {
            this.updateSessionStatus(QbsStatusBar.sessionStatusName(this._session.status));
        });
        _session.onProjectUriChanged(uri => {
            this.updateProjectFileName(uri);
        });
        _session.onProfileNameChanged(name => {
            this.updateProfileName(name);
        });
        _session.onConfigurationNameChanged(name => {
            this.updateConfigurationName(name);
        });

        this.initialize();
    }

    // Public static methods.

    static create(session: QbsSession) {
        const statusbar = new QbsStatusBar(session);
        return statusbar;
    }

    // Public overriden methods.
    dispose(): void { }

    // Private static methods.

    private static sessionStatusName(status: QbsSessionStatus) {
        switch (status) {
        case QbsSessionStatus.Started:
            return localize('qbs.session.status.started', `started`);
        case QbsSessionStatus.Starting:
            return localize('qbs.session.status.starting', `starting`);
        case QbsSessionStatus.Stopped:
            return localize('qbs.session.status.stopped', `stopped`);
        case QbsSessionStatus.Stopping:
            return localize('qbs.session.status.stopping', `stopping`);
        }
    }

    // Private methods.

    private async initialize() {
        await this.updateSessionStatus(QbsStatusBar.sessionStatusName(this._session.status));
        await this.updateProjectFileName();
        await this.updateProfileName();
        await this.updateConfigurationName();
    }

    private async updateSessionStatus(status: string) {
        this._statusButton.text = localize('qbs.session.status', `QBS (${status})`);
    }

    private async updateProjectFileName(uri?: vscode.Uri) {
        const projectName = uri ? basename(uri.fsPath) : localize('qbs.active.project.empty', 'empty');
        this._projectButton.text = localize('qbs.active.project.select', '$(project) Project (' + projectName + ')');
    }

    private async updateProfileName(profile?: string) {
        const profileName = profile ? profile : localize('qbs.active.profile.empty', 'empty');
        this._profileButton.text = localize('qbs.build.profile.select', `$(settings) Profile (${profileName})`);
    }

    private async updateConfigurationName(configuration?: string) {
        const configurationName = configuration ? configuration : 'default';
        this._configurationButton.text = localize('qbs.build.configuration.select', `$(settings-gear) Configuration (${configurationName})`);
    }
}
