import { Tree } from '@angular-devkit/schematics';
/**
 * Whether the Angular module in the given path imports the specified module class name.
 */
export declare const hasNgModuleImport: (tree: Tree, modulePath: string, className: string) => boolean;
