"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasNgModuleImport = void 0;
const ts = require("typescript");
/**
 * Whether the Angular module in the given path imports the specified module class name.
 */
const hasNgModuleImport = (tree, modulePath, className) => {
    const moduleFileContent = tree.read(modulePath);
    if (!moduleFileContent) {
        throw new Error(`Could not read Angular module file: ${modulePath}`);
    }
    const parsedFile = ts.createSourceFile(modulePath, moduleFileContent.toString(), ts.ScriptTarget.Latest, true);
    let ngModuleMetadata = null;
    const findModuleDecorator = (node) => {
        if (ts.isDecorator(node) &&
            ts.isCallExpression(node.expression) &&
            isNgModuleCallExpression(node.expression)) {
            ngModuleMetadata = node.expression
                .arguments[0];
            return;
        }
        ts.forEachChild(node, findModuleDecorator);
    };
    ts.forEachChild(parsedFile, findModuleDecorator);
    if (ngModuleMetadata) {
        for (const property of ngModuleMetadata
            .properties) {
            if (!ts.isPropertyAssignment(property) ||
                property.name.getText() !== 'imports' ||
                !ts.isArrayLiteralExpression(property.initializer)) {
                continue;
            }
            if (property.initializer.elements.some((element) => element.getText().includes(className))) {
                return true;
            }
        }
    }
    else {
        throw new Error(`Could not find NgModule declaration inside: "${modulePath}"`);
    }
    return false;
};
exports.hasNgModuleImport = hasNgModuleImport;
/**
 * Resolves the last identifier that is part of the given expression. This helps resolving
 * identifiers of nested property access expressions (e.g. myNamespace.core.NgModule).
 */
const resolveIdentifierOfExpression = (expression) => {
    if (ts.isIdentifier(expression)) {
        return expression;
    }
    else if (ts.isPropertyAccessExpression(expression)) {
        return resolveIdentifierOfExpression(expression.expression);
    }
    return null;
};
/** Whether the specified call expression is referring to a NgModule definition. */
const isNgModuleCallExpression = (callExpression) => {
    if (!(callExpression.arguments && callExpression.arguments.length) ||
        !ts.isObjectLiteralExpression(callExpression.arguments[0])) {
        return false;
    }
    const decoratorIdentifier = resolveIdentifierOfExpression(callExpression.expression);
    return decoratorIdentifier ? decoratorIdentifier.text === 'NgModule' : false;
};
//# sourceMappingURL=ng-module-imports.js.map