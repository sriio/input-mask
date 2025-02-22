"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectMainFile = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const project_targets_1 = require("./project-targets");
/** Looks for the main TypeScript file in the given project and returns its path. */
const getProjectMainFile = (project) => {
    const buildOptions = (0, project_targets_1.getProjectTargetOptions)(project, 'build');
    if (!buildOptions.main) {
        throw new schematics_1.SchematicsException(`Could not find the project main file inside of the ` +
            `workspace config (${project.sourceRoot})`);
    }
    return buildOptions.main;
};
exports.getProjectMainFile = getProjectMainFile;
//# sourceMappingURL=project-main-file.js.map