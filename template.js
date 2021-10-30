//=============================================================================
// *******.js
// 作成者     :げれげれ 
// 作成日     : 20**/**/**
// 最終更新日 : 20//
// バージョン : v*.*.*
// ----------------------------------------------------------------------------
// Released under the MIT License.
// https://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 
 * @author げれげれ
 *
 * @param 
 * @type 
 * @min 
 * @max 
 * @desc 
 * @default 
 *
 * @help
 * 
 * 
 * 
 *【プラグインパラメータ】
 * 
 * 
 * 
 *【プラグインコマンド】
 * 
 * 
 * 
 *【メモタグ】
 * 
 * 
 * 
 */

//==============================================================================

'use strict';

{
/* プラグインパラメータ */
const PARAMETERS = PluginManager.parameters('');
const **** = parseInt(PARAMETERS['****']);

/* プラグインコマンド　*/
const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    const commandUppercase = command.toUpperCase();
    switch (commandUppercase) {
        case '****':

            break;
    };   
};





}