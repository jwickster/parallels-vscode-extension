import * as vscode from "vscode";
import {Provider} from "../../ioc/provider";
import {VirtualMachineGroup} from "../../models/virtualMachineGroup";
import {VirtualMachineProvider} from "../virtual_machine";
import {CommandsFlags, TelemetryEventIds} from "../../constants/flags";
import {LogService} from "../../services/logService";

export function registerAddGroupCommand(context: vscode.ExtensionContext, provider: VirtualMachineProvider) {
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandsFlags.treeAddGroup, async () => {
      const config = Provider.getConfiguration();
      const groupName = await vscode.window.showInputBox({
        prompt: "Group Name?",
        placeHolder: "Enter the name for the group"
      });
      if (groupName) {
        const group = config.getVirtualMachineGroup(`/${groupName}`);
        if (group) {
          vscode.window.showErrorMessage(`Group ${groupName} already exists on the root`);
          LogService.error(`Group ${groupName} already exists`, "AddGroupCommand");
          LogService.sendTelemetryEvent(TelemetryEventIds.GroupAction, `Group ${groupName} already exists`);
          return;
        }

        LogService.sendTelemetryEvent(TelemetryEventIds.GroupAction, "Group Added");
        config.addVirtualMachineGroup(new VirtualMachineGroup(groupName));
        vscode.commands.executeCommand(CommandsFlags.treeRefreshVms);
        LogService.info(`Group ${groupName} added`, "AddGroupCommand");
      }
    })
  );
}
