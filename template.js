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


(function() {
'use strict';

/* プラグインパラメータ */
const PARAMETERS = PluginManager.parameters('');
const **** = Number(PARAMETERS['****']);

/* プラグインコマンド　*/
const _game_interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _game_interpreter_pluginCommand.call(this, command, args);
    const command_T = command.toUpperCase();
    switch (command_T) {
        case '****':

            break;
    };   
};





})();